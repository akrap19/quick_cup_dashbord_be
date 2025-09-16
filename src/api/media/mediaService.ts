import { ResponseCode } from '../../interface'
import {
  ICreateMedia,
  IDeleteMedia,
  IGetMediaByName,
  IMediaService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Media } from './mediaModel'
import { deleteFile, getSignedURL, uploadFile } from '../../services/google'
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
        url: (await getSignedURL(media.url)) || media.url
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
        url: (await getSignedURL(media.url)) || media.url
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
}
