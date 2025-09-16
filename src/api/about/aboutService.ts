import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { MediaService } from '../media/mediaService'
import { getSignedURL } from '../../services/google'
import {
  IAboutImageLimited,
  IAboutLimited,
  IAboutService,
  IAddAboutImages,
  IBulkDeleteAbouts,
  ICreateAbout,
  IDeleteAbout,
  IDeleteAboutImage,
  IGetAboutImages,
  IGetAbouts,
  IRemoveUnusedAbouts
} from './interface'
import { About } from './aboutModel'
import { AboutImage } from './aboutImageModel'
import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class AboutService implements IAboutService {
  private readonly aboutRepository: Repository<About>
  private readonly aboutImageRepository: Repository<AboutImage>
  private readonly mediaService: MediaService

  constructor(mediaService: MediaService) {
    this.aboutRepository = AppDataSource.manager.getRepository(About)
    this.aboutImageRepository = AppDataSource.manager.getRepository(AboutImage)
    this.mediaService = mediaService
  }

  createAbout = async ({ barnahusId, queryRunner }: ICreateAbout) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let insertResult = await this.aboutRepository
        .createQueryBuilder('about', queryRunner)
        .insert()
        .into(About)
        .values([
          {
            barnahusId
          }
        ])
        .execute()
      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }

      return { aboutId: insertResult.identifiers[0].id as string, code }
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

  addAboutImages = async ({ images, queryRunner }: IAddAboutImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      if (images.length == 0) {
        return { code }
      }

      let insertResult = await this.aboutImageRepository
        .createQueryBuilder('aboutImage', queryRunner)
        .insert()
        .into(AboutImage)
        .values(images)
        .execute()

      if (insertResult.raw.affectedRows !== images.length) {
        code = ResponseCode.FAILED_INSERT
      }

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

  getAboutImages = async ({ aboutId, signUrl = true }: IGetAboutImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let aboutImages = await this.aboutImageRepository
        .createQueryBuilder('aboutImage')
        .leftJoinAndSelect('aboutImage.media', 'media')
        .where('aboutImage.aboutId = :aboutId', { aboutId })
        .getMany()

      let aboutImagesLimited: IAboutImageLimited[] = []

      for (let image of aboutImages) {
        aboutImagesLimited.push({
          aboutImageId: image.id,
          mediaId: image.mediaId,
          url: signUrl
            ? (await getSignedURL(image.media.url)) || image.media.url
            : image.media.url
        })
      }

      return { aboutImages: aboutImagesLimited, code }
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

  deleteAboutImage = async ({ aboutImageId }: IDeleteAboutImage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let aboutImage = await this.aboutImageRepository
        .createQueryBuilder('aboutImage')
        .where('id = :aboutImageId', { aboutImageId })
        .getOne()
      if (!aboutImage) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      const { code } = await this.mediaService.deleteMedia({
        mediaId: aboutImage.mediaId
      })

      await this.aboutImageRepository
        .createQueryBuilder('aboutImage')
        .delete()
        .where('id = :aboutImageId', { aboutImageId })
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

  deleteAbout = async ({ aboutId, queryRunner }: IDeleteAbout) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let about = await this.aboutRepository
        .createQueryBuilder('about', queryRunner)
        .where('id = :aboutId', { aboutId })
        .getOne()
      if (!about) {
        return { code: ResponseCode.ABOUT_NOT_FOUND }
      }

      const deleteResult = await this.aboutRepository
        .createQueryBuilder('about', queryRunner)
        .delete()
        .from(About)
        .where('id = :aboutId', { aboutId })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }

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

  bulkDeleteAbouts = async ({ aboutIds }: IBulkDeleteAbouts) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const aboutId of aboutIds) {
        const deleteResult = await this.deleteAbout({ aboutId, queryRunner })

        if (deleteResult.code != ResponseCode.OK) {
          code = deleteResult.code
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })

      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }

    return { code }
  }

  getAbouts = async ({ barnahusId, page, limit }: IGetAbouts) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.aboutRepository
        .createQueryBuilder('about')
        .where('about.barnahusId = :barnahusId', { barnahusId })

      page = page || 1
      const offset = limit && page ? (page - 1) * limit : 0
      const [abouts, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      const aboutsLimited: IAboutLimited[] = abouts.map((about) => {
        return {
          aboutId: about.id,
          barnahusId: about.barnahusId
        }
      })

      return {
        aboutData: {
          abouts: aboutsLimited,
          pagination: {
            count,
            page,
            limit
          }
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

  removeUnusedAbouts = async ({ barnahusId }: IRemoveUnusedAbouts) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const aboutsWithoutTranslations = await this.aboutRepository
        .createQueryBuilder('about')
        .leftJoin('about.aboutTranslations', 'aboutTranslation')
        .where('aboutTranslation.aboutId IS NULL')
        .andWhere('about.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (aboutsWithoutTranslations.length === 0) {
        return { code }
      }

      await this.aboutRepository
        .createQueryBuilder('about')
        .delete()
        .from(About)
        .where('about.id IN (:...aboutIds)', {
          aboutIds: aboutsWithoutTranslations.map((x) => x.id)
        })
        .execute()

      return {
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
