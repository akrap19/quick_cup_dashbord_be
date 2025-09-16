import { AsyncResponse, ResponseCode } from '../../interface'
import {
  ILanguageService,
  IBulkDeleteLanguages,
  ICheckLanguagePublishable,
  ICreateLanguage,
  IDeleteLanguage,
  IEditLanguage,
  IGetLanguage,
  IGetLanguages,
  IPublishLanguage,
  ISearchSupportedLanguages,
  LanguageStatus,
  IAutoTranslate,
  ISearchLanguages,
  IGetDefaultLanguage,
  ISetDefaultLanguage,
  ITranslateContent,
  ICheckLanguageStatus
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { BarnahusLanguage } from './languageModel'
import { getSupportedLanguages, translate } from '../../services/google'
import stringSimilarity from 'string-similarity-js'
import { Repository } from 'typeorm'
import { AboutTranslationService } from '../about_translation/aboutTranslationService'
import { RoomTranslationService } from '../room_translation/roomTranslationService'
import { StaffTranslationService } from '../staff_translation/staffTranslationService'
import { AboutStatus } from '../about_translation/interface'
import { RoomStatus } from '../room_translation/interface'
import { StaffStatus } from '../staff_translation/interface'
import { autoInjectable } from 'tsyringe'
import { ContentService } from '../content/contentService'

@autoInjectable()
export class LanguageService implements ILanguageService {
  private readonly languageRepository: Repository<BarnahusLanguage>
  private readonly aboutTranslationService: AboutTranslationService
  private readonly roomTranslationService: RoomTranslationService
  private readonly staffTranslationService: StaffTranslationService
  private readonly contentService: ContentService

  constructor(
    aboutTranslationService: AboutTranslationService,
    roomTranslationService: RoomTranslationService,
    staffTranslationService: StaffTranslationService,
    contentService: ContentService
  ) {
    this.languageRepository =
      AppDataSource.manager.getRepository(BarnahusLanguage)
    this.aboutTranslationService = aboutTranslationService
    this.roomTranslationService = roomTranslationService
    this.staffTranslationService = staffTranslationService
    this.contentService = contentService
  }

  createLanguage = async ({
    name,
    languageCode,
    autoTranslate,
    translateable,
    barnahusId
  }: ICreateLanguage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      if (!languageCode && autoTranslate == true) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      let existingLanguage = await this.languageRepository.findOne({
        where: { name, barnahusId }
      })
      if (existingLanguage) {
        return { code: ResponseCode.CONFLICT_DUPLICATE_LANGUAGE }
      }

      let firstLanguage = await this.languageRepository.findOne({
        where: { barnahusId },
        order: { createdAt: 'ASC' }
      })

      if (!firstLanguage && autoTranslate == true) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      let translateableLanguage = await this.languageRepository.findOne({
        where: {
          translateable: true,
          barnahusId,
          status: LanguageStatus.PUBLISHED
        }
      })

      if (!translateableLanguage && autoTranslate == true) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      let insertResult = await this.languageRepository
        .createQueryBuilder()
        .insert()
        .into(BarnahusLanguage)
        .values([
          {
            name,
            status: LanguageStatus.DRAFT,
            autoTranslate,
            languageCode,
            translateable: translateable ? translateable : !!languageCode,
            isDefault: firstLanguage ? false : true,
            barnahusId
          }
        ])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }
    } catch (err: any) {
      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_LANGUAGE
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

  getLanguages = async ({ status, page, limit, barnahusId }: IGetLanguages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .leftJoinAndSelect('barnahusLanguage.cases', 'cases')
        .where('barnahusLanguage.barnahusId = :barnahusId', { barnahusId })

      if (status) {
        query.andWhere('barnahusLanguage.status = :status', { status })
      }

      const offset = (page - 1) * limit
      const [languages, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!languages) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      return {
        languagesData: {
          languages: languages,
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

  getLanguage = async ({ languageId }: IGetLanguage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let language = await this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .leftJoinAndSelect('barnahusLanguage.cases', 'cases')
        .where('barnahusLanguage.id = :languageId', { languageId })
        .getOne()

      if (!language) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      return {
        language,
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

  editLanguage = async ({
    languageId,
    name,
    autoTranslate,
    status
  }: IEditLanguage) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      let language = await this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .where('id = :languageId', { languageId })
        .getOne()
      if (!language) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      if (!language.translateable && autoTranslate == true) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      if (
        language.status != LanguageStatus.DRAFT &&
        status == LanguageStatus.DRAFT
      ) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.LANGUAGE_ALREADY_PUBLISHED }
      }

      let existingLanguage = await this.languageRepository.findOne({
        where: { name, barnahusId: language.barnahusId }
      })
      if (existingLanguage && existingLanguage.id != language.id) {
        return { code: ResponseCode.CONFLICT_DUPLICATE_LANGUAGE }
      }

      if (
        status == LanguageStatus.PUBLISHED &&
        (language.status == LanguageStatus.DRAFT ||
          language.status == LanguageStatus.HIDDEN)
      ) {
        const { publishable } = await this.checkLanguagePublishable({
          languageId,
          barnahusId: language.barnahusId
        })

        if (!publishable) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.LANGUAGE_NOT_PUBLISHABLE }
        }

        const { code: publishCode } = await this.publishLanguage({
          languageId,
          barnahusId: language.barnahusId,
          queryRunner
        })

        if (publishCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: publishCode }
        }
      }

      const languageEditResult = await this.languageRepository
        .createQueryBuilder('barnahusLanguage', queryRunner)
        .update(BarnahusLanguage)
        .set({
          name,
          status,
          autoTranslate: autoTranslate
        })
        .where('id = :languageId', { languageId })
        .execute()

      if (languageEditResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_EDIT }
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

  setDefaultLanguage = async ({
    languageId,
    barnahusId
  }: ISetDefaultLanguage) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      let language = await this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .where('id = :languageId', { languageId })
        .andWhere('barnahusLanguage.barnahusId = :barnahusId', { barnahusId })
        .getOne()
      if (!language) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      if (!language.isDefault) {
        const { publishable } = await this.checkLanguagePublishable({
          languageId,
          barnahusId: language.barnahusId
        })

        if (!publishable) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.LANGUAGE_CANNOT_BE_DEFAULT }
        }

        const languageEditResult = await this.languageRepository
          .createQueryBuilder('barnahusLanguage', queryRunner)
          .update(BarnahusLanguage)
          .set({
            isDefault: true
          })
          .where('id = :languageId', { languageId })
          .execute()

        if (languageEditResult.affected !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.FAILED_EDIT }
        }
      }

      await this.languageRepository
        .createQueryBuilder('barnahusLanguage', queryRunner)
        .update(BarnahusLanguage)
        .set({ isDefault: false })
        .where('barnahusId = :barnahusId', {
          barnahusId: language.barnahusId
        })
        .andWhere('id != :excludedId', { excludedId: languageId })
        .execute()

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

  deleteLanguage = async ({ languageId, queryRunner }: IDeleteLanguage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const language = await this.languageRepository.findOne({
        where: { id: languageId },
        relations: ['cases']
      })
      if (!language) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      if (language.isDefault) {
        return { code: ResponseCode.CANNOT_DELETE_DEFAULT_LANGUAGE }
      }

      if (language.cases.length > 0) {
        return { code: ResponseCode.LANGUAGE_HAS_CASES }
      }

      const deleteResult = await this.languageRepository
        .createQueryBuilder('barnahusLanguage', queryRunner)
        .delete()
        .from(BarnahusLanguage)
        .where('id = :languageId', { languageId })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }

      await this.contentService.removeUnusedContent({
        barnahusId: language.barnahusId
      })
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

  bulkDeleteLanguages = async ({
    languageIds,
    barnahusId
  }: IBulkDeleteLanguages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const errors = []
      for (const languageId of languageIds) {
        const { code: deleteCode } = await this.deleteLanguage({
          languageId
        })

        if (deleteCode != ResponseCode.OK) {
          errors.push({
            message: getResponseMessage(deleteCode),
            code: deleteCode
          })
        }
      }

      await this.contentService.removeUnusedContent({
        barnahusId
      })

      return { errors, code }
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

  searchSupportedLanguages = async ({ search }: ISearchSupportedLanguages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let languages = await getSupportedLanguages()
      if (!languages) {
        return { code: ResponseCode.FAILED_DEPENDENCY }
      }

      let matches: any[] = []
      for (let language of languages) {
        let similarity = stringSimilarity(language.name!, search || '')
        if (similarity == 1) {
          matches = [{ similarity, language }]
          break
        } else if (similarity > 0.3 || !search) {
          matches.push({ similarity, language })
        }
      }

      matches.sort((a, b) => b.similarity - a.similarity)

      languages = matches.map((match) => {
        return match.language
      })

      languages = languages.slice(0, 10)

      return { languages, code }
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

  checkLanguagePublishable = async ({
    languageId,
    barnahusId
  }: ICheckLanguagePublishable) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { language, code: languageCode } = await this.getLanguage({
        languageId
      })
      if (!language) {
        return { code: languageCode }
      }

      const { translated: aboutsTranslated } =
        await this.aboutTranslationService.checkAboutsTranslated({
          barnahusId,
          languageId
        })

      const { translated: roomsTranslated } =
        await this.roomTranslationService.checkRoomsTranslated({
          barnahusId,
          languageId
        })

      const { translated: staffTranslated } =
        await this.staffTranslationService.checkStaffTranslated({
          barnahusId,
          languageId
        })

      return {
        publishable: aboutsTranslated && roomsTranslated && staffTranslated,
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

  publishLanguage = async ({
    languageId,
    barnahusId,
    queryRunner
  }: IPublishLanguage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { language, code: languageCode } = await this.getLanguage({
        languageId
      })
      if (!language) {
        return { code: languageCode }
      }

      const { code: aboutCode } =
        await this.aboutTranslationService.bulkChangeAboutTranslationStatus({
          barnahusId,
          languageId,
          status: AboutStatus.PUBLISHED,
          queryRunner
        })

      if (aboutCode != ResponseCode.OK) {
        return { code: aboutCode }
      }

      const { code: roomCode } =
        await this.roomTranslationService.bulkChangeRoomTranslationStatus({
          barnahusId,
          languageId,
          status: RoomStatus.PUBLISHED,
          queryRunner
        })

      if (roomCode != ResponseCode.OK) {
        return { code: roomCode }
      }

      const { code: staffCode } =
        await this.staffTranslationService.bulkChangeStaffTranslationStatus({
          barnahusId,
          languageId,
          status: StaffStatus.PUBLISHED,
          queryRunner
        })

      if (staffCode != ResponseCode.OK) {
        return { code: staffCode }
      }

      const languageEditResult = await this.languageRepository
        .createQueryBuilder('barnahusLanguage', queryRunner)
        .update(BarnahusLanguage)
        .set({
          status: LanguageStatus.PUBLISHED
        })
        .where('id = :languageId', { languageId })
        .execute()

      if (languageEditResult.affected !== 1) {
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

  autoTranslate = async ({ languageId, barnahusId }: IAutoTranslate) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { language, code: languageCode } = await this.getLanguage({
        languageId
      })
      if (!language) {
        return { code: languageCode }
      }

      if (!language.translateable || language.autoTranslate == false) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      const { defaultLanguage, code: defaultLanguageCode } =
        await this.getDefaultLanguage({ barnahusId })
      if (!defaultLanguage) {
        return { code: defaultLanguageCode }
      }

      if (!defaultLanguage.translateable) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      const { publishable } = await this.checkLanguagePublishable({
        languageId: defaultLanguage.id,
        barnahusId
      })
      if (!publishable) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      const { content, code: contentCode } =
        await this.contentService.getContent({
          languageId: defaultLanguage.id,
          barnahusId
        })

      if (!content) {
        return { code: contentCode }
      }

      let abouts = []
      for (let aboutTranslation of content.abouts) {
        abouts.push({
          aboutId: aboutTranslation.aboutId,
          title:
            (aboutTranslation.title &&
              (await translate(
                aboutTranslation.title,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          description:
            (aboutTranslation.description &&
              (await translate(
                aboutTranslation.description,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          audio: aboutTranslation.audio,
          aboutImages: aboutTranslation.aboutImages
        })
      }

      let rooms: any = []
      for (let room of content.rooms) {
        rooms.push({
          roomId: room.roomId,
          title:
            (room.title &&
              (await translate(
                room.title,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          description:
            (room.description &&
              (await translate(
                room.description,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          audio: room.audio,
          roomImages: room.roomImages
        })
      }

      let staff = []
      for (let staffMember of content.staff) {
        staff.push({
          staffId: staffMember.staffId,
          name: staffMember.name,
          title:
            (staffMember.title &&
              (await translate(
                staffMember.title,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          description:
            (staffMember.description &&
              (await translate(
                staffMember.description,
                defaultLanguage.languageCode!,
                language.languageCode!
              ))) ||
            null,
          staffImages: staffMember.staffImages
        })
      }

      return { translation: { abouts, rooms, staff }, code }
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

  translateContent = async ({ languageId, content }: ITranslateContent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { language, code: languageCode } = await this.getLanguage({
        languageId
      })
      if (!language) {
        return { code: languageCode }
      }

      if (!language.translateable || language.autoTranslate == false) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      const { defaultLanguage, code: defaultLanguageCode } =
        await this.getDefaultLanguage({ barnahusId: language.barnahusId })
      if (!defaultLanguage) {
        return { code: defaultLanguageCode }
      }

      if (!defaultLanguage.translateable) {
        return { code: ResponseCode.LANGUAGE_NOT_TRANSLATEABLE }
      }

      const translation = await translate(
        content,
        defaultLanguage.languageCode!,
        language.languageCode!
      )

      return { translation, code }
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

  getDefaultLanguage = async ({ barnahusId }: IGetDefaultLanguage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let defaultLanguage = await this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .where(
          'barnahusLanguage.isDefault = :isDefault AND barnahusLanguage.barnahusId = :barnahusId',
          { isDefault: true, barnahusId }
        )
        .andWhere('barnahusLanguage.status = :status', {
          status: LanguageStatus.PUBLISHED
        })
        .orderBy('barnahusLanguage.createdAt', 'ASC')
        .getOne()

      if (!defaultLanguage) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      return { defaultLanguage, code }
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

  searchLanguages = async ({
    search,
    status,
    barnahusId
  }: ISearchLanguages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.languageRepository
        .createQueryBuilder('barnahusLanguage')
        .where('barnahusLanguage.barnahusId = :barnahusId', { barnahusId })

      if (status) {
        query.andWhere('barnahusLanguage.status IN (:status)', {
          status
        })
      }

      if (search) {
        const searchLike = `%${search}%`

        query.andWhere('barnahusLanguage.name LIKE :name', {
          name: searchLike
        })
      }

      let languages = await query.getMany()

      if (!languages) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      return {
        languages,
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

  checkLanguageStatus = async ({
    languageId,
    barnahusId
  }: ICheckLanguageStatus) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const language = await this.languageRepository.findOne({
        where: { id: languageId, barnahusId }
      })

      if (!language) {
        return { code: ResponseCode.LANGUAGE_NOT_FOUND }
      }

      if (language.status == LanguageStatus.DRAFT) {
        return { code: ResponseCode.OK }
      }

      const { publishable, code: publishableCode } =
        await this.checkLanguagePublishable({ languageId, barnahusId })
      if (publishableCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: publishableCode }
      }

      if (!publishable) {
        const { code: bulkAboutCode } =
          await this.aboutTranslationService.bulkChangeAboutTranslationStatus({
            barnahusId,
            languageId,
            status: AboutStatus.DRAFT
          })
        if (bulkAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: bulkAboutCode }
        }

        const { code: bulkRoomCode } =
          await this.roomTranslationService.bulkChangeRoomTranslationStatus({
            barnahusId,
            languageId,
            status: RoomStatus.DRAFT
          })
        if (bulkRoomCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: bulkRoomCode }
        }

        const { code: bulkStaffCode } =
          await this.staffTranslationService.bulkChangeStaffTranslationStatus({
            barnahusId,
            languageId,
            status: StaffStatus.DRAFT
          })
        if (bulkStaffCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: bulkStaffCode }
        }

        const languageEditResult = await this.languageRepository
          .createQueryBuilder('barnahusLanguage', queryRunner)
          .update(BarnahusLanguage)
          .set({
            status: LanguageStatus.DRAFT
          })
          .where('id = :languageId', { languageId })
          .execute()

        if (languageEditResult.affected !== 1) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.FAILED_EDIT }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return {
        code
      }
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
}
