import { NextFunction, Request, Response } from 'express'
import { ResponseCode } from '../../interface'
import { MediaService } from '../media/mediaService'
import fileUpload from 'express-fileupload'
import {
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MediaType
} from './interface'
import { autoInjectable } from 'tsyringe'
import config from '../../config'

@autoInjectable()
export class MediaController {
  private readonly mediaService: MediaService

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService
  }

  uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    const { type } = res.locals.input

    if (!req.files || !req.files.media) {
      return next({ code: ResponseCode.FILE_NOT_FOUND })
    }

    let media = req.files.media as fileUpload.UploadedFile

    if (type == MediaType.IMAGE) {
      if (!ACCEPTED_IMAGE_TYPES.includes(media.mimetype)) {
        return next({ code: ResponseCode.WRONG_INPUT_TYPE })
      }

      if (media.size > config.IMAGE_FILE_SIZE_LIMIT * 1024 * 1024) {
        return next({ code: ResponseCode.FILE_TOO_LARGE })
      }
    }

    if (type == MediaType.VIDEO) {
      if (!ACCEPTED_VIDEO_TYPES.includes(media.mimetype)) {
        return next({ code: ResponseCode.WRONG_INPUT_TYPE })
      }

      if (media.size > config.VIDEO_FILE_SIZE_LIMIT * 1024 * 1024) {
        return next({ code: ResponseCode.FILE_TOO_LARGE })
      }
    }

    if (type == MediaType.AUDIO) {
      if (!ACCEPTED_AUDIO_TYPES.includes(media.mimetype)) {
        return next({ code: ResponseCode.WRONG_INPUT_TYPE })
      }

      if (media.size > config.AUDIO_FILE_SIZE_LIMIT * 1024 * 1024) {
        return next({ code: ResponseCode.FILE_TOO_LARGE })
      }
    }

    if (type == MediaType.FILE) {
      // If ACCEPTED_FILE_TYPES is empty, accept all file types
      if (
        ACCEPTED_FILE_TYPES.length > 0 &&
        !ACCEPTED_FILE_TYPES.includes(media.mimetype)
      ) {
        return next({ code: ResponseCode.WRONG_INPUT_TYPE })
      }
    }

    const { mediaId, code } = await this.mediaService.createMedia({
      type,
      path: `${type.toLowerCase()}/`,
      file: media
    })

    if (!mediaId) {
      return next({ code })
    }

    return next({ data: { mediaId }, code })
  }

  deleteMedia = async (req: Request, res: Response, next: NextFunction) => {
    const { mediaId } = res.locals.input

    const { code } = await this.mediaService.deleteMedia({
      mediaId
    })

    return next({ code })
  }

  downloadMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { mediaId } = input

    const result = await this.mediaService.downloadMedia({
      mediaId
    })

    if (!result.data) {
      return next({ code: result.code })
    }

    // Type guard: check if data has the expected structure
    const fileData = result.data as {
      buffer: Buffer
      fileName: string
      mimeType: string
    }
    if (!fileData.buffer || !fileData.fileName || !fileData.mimeType) {
      return next({ code: result.code })
    }

    const { buffer, fileName, mimeType } = fileData

    // Set headers for file download
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', buffer.length.toString())

    // Send the file buffer
    res.send(buffer)
  }
}
