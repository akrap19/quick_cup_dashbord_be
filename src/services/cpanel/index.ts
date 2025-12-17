import Client from 'ssh2-sftp-client'
import config from '../../config'
import { logger } from '../../logger'
import { ResponseCode, ResponseMessage } from '../../interface'
import path from 'path'

export const uploadFile = async (
  filePath: string,
  remotePath: string,
  fileName: string
): Promise<string | null> => {
  const sftp = new Client()

  try {
    // Ensure the uploads directory exists
    const basePath = config.SFTP_UPLOAD_BASE_PATH || 'uploads'
    const fullRemotePath = path.posix.join(basePath, remotePath, fileName)

    // Validate SFTP configuration
    if (!config.SFTP_HOST || !config.SFTP_USERNAME || !config.SFTP_PASSWORD) {
      throw new Error(
        'SFTP configuration is missing. Please set SFTP_HOST, SFTP_USERNAME, and SFTP_PASSWORD'
      )
    }

    // Connect to SFTP server
    await sftp.connect({
      host: config.SFTP_HOST,
      port: config.SFTP_PORT,
      username: config.SFTP_USERNAME,
      password: config.SFTP_PASSWORD,
      readyTimeout: 30000
    })

    // Ensure the remote directory exists
    const remoteDir = path.posix.join(basePath, remotePath)
    try {
      await sftp.mkdir(remoteDir, true) // true = recursive
    } catch (err: any) {
      // Directory might already exist, which is fine
      if (err.code !== 4) {
        // Error code 4 is "Failure" but might be directory exists
        logger.warn({
          message: `Could not create directory ${remoteDir}: ${err.message}`
        })
      }
    }

    // Upload the file
    await sftp.put(filePath, fullRemotePath)

    // Close the connection
    await sftp.end()

    // Return the path that will be stored in the database
    // This will be used to construct the URL later
    return fullRemotePath
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack,
      details: `SFTP upload failed: ${err.message}`
    })

    // Make sure to close the connection on error
    try {
      await sftp.end()
    } catch (closeErr) {
      // Ignore close errors
    }

    return null
  }
}

/**
 * Deletes a file from cPanel via SFTP
 * @param remotePath - Full remote path of the file to delete (e.g., 'uploads/image/file.jpg')
 */
export const deleteFile = async (remotePath: string): Promise<void> => {
  const sftp = new Client()

  try {
    // Validate SFTP configuration
    if (!config.SFTP_HOST || !config.SFTP_USERNAME || !config.SFTP_PASSWORD) {
      throw new Error(
        'SFTP configuration is missing. Please set SFTP_HOST, SFTP_USERNAME, and SFTP_PASSWORD'
      )
    }

    // Connect to SFTP server
    await sftp.connect({
      host: config.SFTP_HOST,
      port: config.SFTP_PORT,
      username: config.SFTP_USERNAME,
      password: config.SFTP_PASSWORD,
      readyTimeout: 30000
    })

    // Delete the file
    await sftp.delete(remotePath)

    // Close the connection
    await sftp.end()
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack,
      details: `SFTP delete failed: ${err.message}`
    })

    // Make sure to close the connection on error
    try {
      await sftp.end()
    } catch (closeErr) {
      // Ignore close errors
    }
  }
}

/**
 * Gets the public URL for a file stored on cPanel
 * @param remotePath - Full remote path of the file (e.g., 'uploads/image/file.jpg')
 * @returns The public URL to access the file, or null if base URL is not configured
 */
export const getFileURL = async (
  remotePath: string
): Promise<string | null> => {
  try {
    if (!config.SFTP_BASE_URL) {
      return null
    }

    // Construct the public URL
    // Remove leading slash if present and ensure proper URL format
    let cleanPath = remotePath.startsWith('/')
      ? remotePath.slice(1)
      : remotePath

    // Remove public_html/ from the path if present
    if (cleanPath.startsWith('public_html/')) {
      cleanPath = cleanPath.replace('public_html/', '')
    }

    const baseUrl = config.SFTP_BASE_URL.endsWith('/')
      ? config.SFTP_BASE_URL.slice(0, -1)
      : config.SFTP_BASE_URL

    return `${baseUrl}/${cleanPath}`
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack,
      details: `Failed to construct file URL: ${err.message}`
    })
    return null
  }
}
