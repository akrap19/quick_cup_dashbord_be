import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  IAboutTranslationService,
  ICreateAboutTranslation,
  IEditAboutTranslation,
  IGetAboutTranslation,
  IGetAboutTranslations,
  ICheckAboutTranslated,
  IBulkCreateAboutTranslation,
  ICreateFullAboutTranslation,
  IChangeAboutTranslationStatus,
  IBulkChangeAboutTranslationStatus,
  IGetAboutTranslationsByLanguageId,
  IAboutTranslation
} from './interface'
import { AboutTranslation } from './aboutTranslationModel'
import { Repository } from 'typeorm'
import { AboutService } from '../about/aboutService'
import { autoInjectable } from 'tsyringe'
import { MediaService } from '../media/mediaService'

@autoInjectable()
export class AboutTranslationService implements IAboutTranslationService {
  private readonly aboutTranslationRepository: Repository<AboutTranslation>
  private readonly aboutService: AboutService
  private readonly mediaService: MediaService

  constructor(aboutService: AboutService, mediaService: MediaService) {
    this.aboutTranslationRepository =
      AppDataSource.manager.getRepository(AboutTranslation)
    this.aboutService = aboutService
    this.mediaService = mediaService
  }

  createAboutTranslation = async ({
    aboutId,
    languageId,
    title,
    description,
    audioId,
    barnahusId,
    images,
    deletedImages,
    status
  }: ICreateAboutTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (!aboutId) {
        const { aboutId: newAboutId, code: aboutCode } =
          await this.aboutService.createAbout({
            barnahusId,
            queryRunner
          })

        if (!newAboutId) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: aboutCode }
        }

        aboutId = newAboutId
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          aboutId: aboutId!,
          mediaId: image
        }))

        const { code: imageCode } = await this.aboutService.addAboutImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.aboutService.deleteAboutImage({
            aboutImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      let insertResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .insert()
        .into(AboutTranslation)
        .values([
          {
            aboutId,
            languageId,
            title,
            description,
            audioId,
            status
          }
        ])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_TRANSLATION
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

  getAboutTranslations = async ({
    barnahusId,
    languageId,
    page,
    limit
  }: IGetAboutTranslations) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation')
        .leftJoinAndSelect('aboutTranslation.about', 'about')
        .leftJoinAndSelect('aboutTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('aboutTranslation.audio', 'media')
        .leftJoinAndSelect('about.aboutImages', 'aboutImage')
        .where('about.barnahusId = :barnahusId', { barnahusId })
        .andWhere('aboutTranslation.languageId = :languageId', { languageId })

      const offset = (page - 1) * limit
      const [aboutTranslations, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!aboutTranslations) {
        return { code: ResponseCode.ABOUT_TRANSLATION_NOT_FOUND }
      }

      return {
        aboutData: {
          aboutTranslations,
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

  getAboutTranslation = async ({
    aboutTranslationId
  }: IGetAboutTranslation) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let aboutTranslation = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation')
        .leftJoinAndSelect('aboutTranslation.about', 'about')
        .leftJoinAndSelect('aboutTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('about.aboutImages', 'aboutImage')
        .where('aboutTranslation.id = :aboutTranslationId', {
          aboutTranslationId
        })
        .getOne()

      if (!aboutTranslation) {
        return { code: ResponseCode.ABOUT_TRANSLATION_NOT_FOUND }
      }

      const { media: audio, code: audioCode } =
        await this.mediaService.getMedia({
          mediaId: aboutTranslation.audioId ?? ''
        })

      const { aboutImages, code: imagesCode } =
        await this.aboutService.getAboutImages({
          aboutId: aboutTranslation.aboutId
        })
      if (!aboutImages) {
        return { code: imagesCode }
      }

      return {
        aboutTranslation: {
          aboutId: aboutTranslation.about.id,
          aboutTranslationId: aboutTranslation.id,
          languageId: aboutTranslation.languageId,
          title: aboutTranslation.title,
          description: aboutTranslation.description,
          audio,
          updated: aboutTranslation.updatedAt,
          status: aboutTranslation.status,
          aboutImages
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

  getAboutTranslationsByLanguageId = async ({
    aboutIds,
    languageId
  }: IGetAboutTranslationsByLanguageId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const aboutTranslations: IAboutTranslation[] = []
      if (aboutIds.length == 0) {
        return { aboutTranslations, code }
      }

      let translations = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation')
        .leftJoinAndSelect('aboutTranslation.about', 'about')
        .leftJoinAndSelect('aboutTranslation.language', 'barnahusLanguage')
        .where('aboutTranslation.aboutId IN (:...aboutIds)', {
          aboutIds
        })
        .andWhere('aboutTranslation.languageId = :languageId', {
          languageId
        })
        .getMany()

      if (translations.length != aboutIds.length) {
        return { code: ResponseCode.ABOUT_TRANSLATION_NOT_FOUND }
      }

      for (const aboutTranslation of translations) {
        const { aboutImages, code: imagesCode } =
          await this.aboutService.getAboutImages({
            aboutId: aboutTranslation.aboutId,
            signUrl: false
          })
        if (!aboutImages) {
          return { code: imagesCode }
        }

        aboutTranslations.push({
          aboutId: aboutTranslation.about.id,
          aboutTranslationId: aboutTranslation.id,
          languageId: aboutTranslation.languageId,
          title: aboutTranslation.title,
          description: aboutTranslation.description,
          audioId: aboutTranslation.audioId,
          updated: aboutTranslation.updatedAt,
          status: aboutTranslation.status,
          aboutImages
        })
      }

      return {
        aboutTranslations,
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

  editAboutTranslation = async ({
    aboutTranslation,
    title,
    description,
    audioId,
    images,
    deletedImages
  }: IEditAboutTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (!audioId && aboutTranslation.audio) {
        await this.mediaService.deleteMedia({
          mediaId: aboutTranslation.audio.id
        })
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          aboutId: aboutTranslation.aboutId,
          mediaId: image
        }))

        const { code: imageCode } = await this.aboutService.addAboutImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.aboutService.deleteAboutImage({
            aboutImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      const aboutTranslationEditResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .update(AboutTranslation)
        .set({
          title,
          description,
          audioId
        })
        .where('id = :aboutTranslationId', {
          aboutTranslationId: aboutTranslation.aboutTranslationId
        })
        .execute()

      if (aboutTranslationEditResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_EDIT }
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
    }

    return { code }
  }

  checkAboutsTranslated = async ({
    barnahusId,
    languageId
  }: ICheckAboutTranslated) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const {
        aboutData: aboutTranslationData,
        code: aboutTranslationDataCode
      } = await this.getAboutTranslations({
        barnahusId,
        languageId,
        page: 1,
        limit: 1000
      })
      if (!aboutTranslationData) {
        return { code: aboutTranslationDataCode }
      }

      const { aboutData, code: aboutDataCode } =
        await this.aboutService.getAbouts({
          barnahusId,
          page: 1,
          limit: 1000
        })
      if (!aboutData) {
        return { code: aboutDataCode }
      }

      let translated =
        aboutData.abouts.length > 0 &&
        aboutTranslationData.aboutTranslations.length == aboutData.abouts.length

      return { translated, code }
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

  bulkCreateAboutTranslation = async ({
    barnahusId,
    translations
  }: IBulkCreateAboutTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (let translation of translations) {
        if (!translation.aboutId) {
          const { aboutId: newAboutId, code: aboutCode } =
            await this.aboutService.createAbout({
              barnahusId,
              queryRunner
            })

          if (!newAboutId) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: aboutCode }
          }

          translation.aboutId = newAboutId
        }

        if (translation.images) {
          const mappedImages = translation.images.map((image) => ({
            aboutId: translation.aboutId!,
            mediaId: image
          }))

          const { code: imageCode } = await this.aboutService.addAboutImages({
            images: mappedImages,
            queryRunner
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }

        if (translation.deletedImages) {
          for (let image of translation.deletedImages) {
            const { code: imageCode } =
              await this.aboutService.deleteAboutImage({
                aboutImageId: image
              })

            if (imageCode != ResponseCode.OK) {
              await queryRunner.rollbackTransaction()
              await queryRunner.release()
              return { code: imageCode }
            }
          }
        }
      }

      let insertResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .insert()
        .into(AboutTranslation)
        .values(translations)
        .execute()

      if (insertResult.raw.affectedRows !== translations.length) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  createFullAboutTranslations = async ({
    barnahusId,
    translations,
    images,
    deletedImages
  }: ICreateFullAboutTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { aboutId, code: aboutCode } = await this.aboutService.createAbout({
        barnahusId,
        queryRunner
      })
      if (!aboutId) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: aboutCode }
      }

      const mappedTranslations = translations.map(
        ({ languageId, title, description, audioId, status }) => ({
          aboutId,
          languageId,
          title,
          description,
          audioId,
          status
        })
      )

      let insertResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .insert()
        .into(AboutTranslation)
        .values(mappedTranslations)
        .execute()

      if (insertResult.raw.affectedRows !== translations.length) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          aboutId,
          mediaId: image
        }))

        const { code: imageCode } = await this.aboutService.addAboutImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.aboutService.deleteAboutImage({
            aboutImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_TRANSLATION
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

  changeAboutTranslationStatus = async ({
    aboutTranslationId,
    status,
    queryRunner
  }: IChangeAboutTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const aboutTranslationEditResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .update(AboutTranslation)
        .set({
          status
        })
        .where('id = :aboutTranslationId', { aboutTranslationId })
        .execute()

      if (aboutTranslationEditResult.affected !== 1) {
        return { code: ResponseCode.FAILED_EDIT }
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

  bulkChangeAboutTranslationStatus = async ({
    barnahusId,
    languageId,
    status,
    queryRunner
  }: IBulkChangeAboutTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const {
        aboutData: aboutTranslationData,
        code: aboutTranslationDataCode
      } = await this.getAboutTranslations({
        barnahusId,
        languageId,
        page: 1,
        limit: 1000
      })
      if (!aboutTranslationData) {
        return { code: aboutTranslationDataCode }
      }

      const mappedAboutIds = aboutTranslationData.aboutTranslations.map(
        (about) => about.aboutId
      )

      const aboutTranslationEditResult = await this.aboutTranslationRepository
        .createQueryBuilder('aboutTranslation', queryRunner)
        .update(AboutTranslation)
        .set({
          status
        })
        .where('aboutId IN (:...aboutIds)', {
          aboutIds: mappedAboutIds
        })
        .andWhere('languageId = :languageId', { languageId })
        .execute()

      if (aboutTranslationEditResult.affected !== mappedAboutIds.length) {
        return { code: ResponseCode.FAILED_EDIT }
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
