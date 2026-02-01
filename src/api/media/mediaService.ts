import { ResponseCode, AsyncResponse } from '../../interface'
import {
  ICreateMedia,
  IDeleteMedia,
  IGetMediaByName,
  IMediaService,
  IDownloadMedia
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Media } from './mediaModel'
import { deleteFile, getFileURL, uploadFile, downloadFile } from '../../services/cpanel'
import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'
import { generateUUID } from '../../services/uuid'

@autoInjectable()
export class MediaService implements IMediaService {
  private readonly mediaRepository: Repository<Media>

  constructor() {
    this.mediaRepository = AppDataSource.manager.getRepository(Media)
  }

  createMedia = async ({ type, path, file }: ICreateMedia) => {
    let code: ResponseCode = ResponseCode.OK
    let url

    try {
      const uid = generateUUID()

      url = await uploadFile(file.tempFilePath, path, `${uid}-${file.name}`)
      if (!url) {
        return { code: ResponseCode.FAILED_UPLOAD }
      }

      let insertResult = await this.mediaRepository
        .createQueryBuilder()
        .insert()
        .into(Media)
        .values([
          {
            name: file.name,
            url,
            type
          }
        ])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }

      const [media] = insertResult.identifiers

      return { mediaId: media.id, code }
    } catch (err: any) {
      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_FILE
          url && (await deleteFile(url))
          break
        default:
          code = ResponseCode.SERVER_ERROR
          logger.error({
            code,
            message: getResponseMessage(code),
            stack: err.stack
          })
      }
    }

    return { code }
  }

  getMedia = async ({ mediaId }: IDeleteMedia) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let media = await this.mediaRepository
        .createQueryBuilder('media')
        .where('id = :mediaId', { mediaId })
        .getOne()

      if (!media) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      const mediaResponse = {
        id: media.id,
        name: media.name,
        url: (await getFileURL(media.url)) || media.url
      }

      return {
        media: mediaResponse,
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  getMediaByName = async ({ name }: IGetMediaByName) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let media = await this.mediaRepository
        .createQueryBuilder('media')
        .where('name = :name', { name })
        .getOne()

      if (!media) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      const mediaResponse = {
        id: media.id,
        name: media.name,
        url: (await getFileURL(media.url)) || media.url
      }

      return {
        media: mediaResponse,
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  deleteMedia = async ({ mediaId }: IDeleteMedia) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let media = await this.mediaRepository
        .createQueryBuilder('media')
        .where('id = :mediaId', { mediaId })
        .getOne()
      if (!media) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      await deleteFile(media.url)

      await this.mediaRepository
        .createQueryBuilder()
        .delete()
        .from(Media)
        .where('id = :mediaId', { mediaId })
        .execute()

      return { code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  downloadMedia = async ({
    mediaId
  }: IDownloadMedia): AsyncResponse<{ buffer: Buffer; fileName: string; mimeType: string }> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const media = await this.mediaRepository
        .createQueryBuilder('media')
        .where('id = :mediaId', { mediaId })
        .getOne()

      if (!media) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      // Download the file from SFTP
      const buffer = await downloadFile(media.url)

      if (!buffer) {
        return { code: ResponseCode.FAILED_DEPENDENCY }
      }

      // Determine MIME type from file extension
      const fileName = media.name
      const extension = fileName.split('.').pop()?.toLowerCase()
      let mimeType = 'application/octet-stream'

      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        psd: 'image/vnd.adobe.photoshop',
        ai: 'application/postscript',
        eps: 'application/postscript',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        mpeg: 'audio/mpeg',
        mp3: 'audio/mpeg',
        txt: 'text/plain',
        rtf: 'application/rtf',
        odt: 'application/vnd.oasis.opendocument.text',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        odp: 'application/vnd.oasis.opendocument.presentation',
        pages: 'application/vnd.apple.pages',
        numbers: 'application/vnd.apple.numbers',
        keynote: 'application/vnd.apple.keynote'
      }

      if (extension && mimeTypes[extension]) {
        mimeType = mimeTypes[extension]
      }

      return {
        data: {
          buffer,
          fileName,
          mimeType
        },
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }
}
