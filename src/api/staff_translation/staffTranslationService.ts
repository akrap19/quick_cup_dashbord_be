import { ResponseCode } from '../../interface'
import {
  IBulkChangeStaffTranslationStatus,
  IBulkCreateStaffTranslation,
  IChangeStaffTranslationStatus,
  ICheckStaffTranslated,
  ICreateFullStaffTranslation,
  ICreateStaffTranslation,
  IEditStaffTranslation,
  IGetStaffTranslation,
  IGetStaffTranslationsByLanguageId,
  IGetStaffTranslations,
  IStaffTranslationService,
  IStaffTranslation
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Repository } from 'typeorm'
import { StaffTranslation } from './staffTranslationModel'
import { StaffService } from '../staff/staffService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class StaffTranslationService implements IStaffTranslationService {
  private readonly staffTranslationRepository: Repository<StaffTranslation>
  private readonly staffService: StaffService

  constructor(staffService: StaffService) {
    this.staffTranslationRepository =
      AppDataSource.manager.getRepository(StaffTranslation)
    this.staffService = staffService
  }

  createStaffTranslation = async ({
    staffId,
    name,
    languageId,
    title,
    description,
    barnahusId,
    images,
    deletedImages,
    status
  }: ICreateStaffTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (!staffId) {
        if (!name) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.BAD_REQUEST }
        }

        const { staffId: newStaffId, code: staffCode } =
          await this.staffService.createStaff({
            name,
            barnahusId,
            queryRunner
          })

        if (!newStaffId) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: staffCode }
        }

        staffId = newStaffId
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          staffId: staffId!,
          mediaId: image
        }))

        const { code: imageCode } = await this.staffService.addStaffImages({
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
          const { code: imageCode } = await this.staffService.deleteStaffImage({
            staffImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      let insertResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .insert()
        .into(StaffTranslation)
        .values([
          {
            staffId,
            languageId,
            title,
            description,
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

  getStaffTranslations = async ({
    barnahusId,
    languageId,
    page,
    limit
  }: IGetStaffTranslations) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.staffTranslationRepository
        .createQueryBuilder('staffTranslation')
        .leftJoinAndSelect('staffTranslation.staff', 'staff')
        .leftJoinAndSelect('staffTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('staff.staffImages', 'staffImage')
        .where('staff.barnahusId = :barnahusId', { barnahusId })
        .andWhere('staffTranslation.languageId = :languageId', { languageId })

      const offset = (page - 1) * limit
      const [staffTranslations, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!staffTranslations) {
        return { code: ResponseCode.STAFF_TRANSLATION_NOT_FOUND }
      }

      return {
        staffData: {
          staffTranslations,
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

  getStaffTranslation = async ({
    staffTranslationId
  }: IGetStaffTranslation) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let translation = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation')
        .leftJoinAndSelect('staffTranslation.staff', 'staff')
        .leftJoinAndSelect('staffTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('staff.staffImages', 'staffImage')
        .where('staffTranslation.id = :staffTranslationId', {
          staffTranslationId
        })
        .getOne()

      if (!translation) {
        return { code: ResponseCode.STAFF_TRANSLATION_NOT_FOUND }
      }

      let staff = translation.staff

      const { staffImages, code: imagesCode } =
        await this.staffService.getStaffImages({
          staffId: staff.id
        })
      if (!staffImages) {
        return { code: imagesCode }
      }

      return {
        staffTranslation: {
          staffId: staff.id,
          staffTranslationId: translation.id,
          languageId: translation.languageId,
          name: staff.name,
          title: translation.title,
          description: translation.description,
          updated: translation.updatedAt,
          status: translation.status,
          staffImages
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

  getStaffTranslationsByLanguageId = async ({
    staffIds,
    languageId
  }: IGetStaffTranslationsByLanguageId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const staffTranslations: IStaffTranslation[] = []
      if (staffIds.length == 0) {
        return { staffTranslations, code }
      }

      let translations = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation')
        .leftJoinAndSelect('staffTranslation.staff', 'staff')
        .leftJoinAndSelect('staffTranslation.language', 'barnahusLanguage')
        .where('staffTranslation.staffId IN (:...staffIds)', {
          staffIds
        })
        .andWhere('staffTranslation.languageId = :languageId', {
          languageId
        })
        .getMany()

      if (!translations) {
        return { code: ResponseCode.STAFF_TRANSLATION_NOT_FOUND }
      }

      for (const staffTranslation of translations) {
        const { staffImages, code: imagesCode } =
          await this.staffService.getStaffImages({
            staffId: staffTranslation.staffId,
            signUrl: false
          })
        if (!staffImages) {
          return { code: imagesCode }
        }

        staffTranslations.push({
          staffId: staffTranslation.staff.id,
          staffTranslationId: staffTranslation.id,
          languageId: staffTranslation.languageId,
          title: staffTranslation.title,
          description: staffTranslation.description,
          name: staffTranslation.staff.name,
          updated: staffTranslation.updatedAt,
          status: staffTranslation.status,
          staffImages
        })
      }

      return {
        staffTranslations,
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

  editStaffTranslation = async ({
    staffTranslation,
    name,
    title,
    description,
    images,
    deletedImages
  }: IEditStaffTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (images) {
        const mappedImages = images.map((image) => ({
          staffId: staffTranslation.staffId!,
          mediaId: image
        }))

        const { code: imageCode } = await this.staffService.addStaffImages({
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
          const { code: imageCode } = await this.staffService.deleteStaffImage({
            staffImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      const staffTranslationEditResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .update(StaffTranslation)
        .set({
          title,
          description
        })
        .where('id = :staffTranslationId', {
          staffTranslationId: staffTranslation.staffTranslationId
        })
        .execute()

      if (staffTranslationEditResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_EDIT }
      }

      const { code: editCode } = await this.staffService.editStaff({
        staffId: staffTranslation.staffId,
        name,
        queryRunner
      })
      if (editCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: editCode }
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

  checkStaffTranslated = async ({
    barnahusId,
    languageId
  }: ICheckStaffTranslated) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const {
        staffData: staffTranslationData,
        code: staffTranslationDataCode
      } = await this.getStaffTranslations({
        barnahusId,
        languageId,
        page: 1,
        limit: 1000
      })
      if (!staffTranslationData) {
        return { code: staffTranslationDataCode }
      }

      const { staffData, code: staffDataCode } =
        await this.staffService.getStaff({
          barnahusId,
          page: 1,
          limit: 1000
        })
      if (!staffData) {
        return { code: staffDataCode }
      }

      let translated =
        staffData.staff.length > 0 &&
        staffTranslationData.staffTranslations.length == staffData.staff.length

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

  bulkCreateStaffTranslation = async ({
    barnahusId,
    translations
  }: IBulkCreateStaffTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (let translation of translations) {
        if (!translation.staffId) {
          if (!translation.name) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.BAD_REQUEST }
          }

          const { staffId: newStaffId, code: staffCode } =
            await this.staffService.createStaff({
              name: translation.name,
              barnahusId,
              queryRunner
            })

          if (!newStaffId) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: staffCode }
          }

          translation.staffId = newStaffId
        }

        if (translation.images) {
          const mappedImages = translation.images.map((image) => ({
            staffId: translation.staffId!,
            mediaId: image
          }))

          const { code: imageCode } = await this.staffService.addStaffImages({
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
              await this.staffService.deleteStaffImage({
                staffImageId: image
              })

            if (imageCode != ResponseCode.OK) {
              await queryRunner.rollbackTransaction()
              await queryRunner.release()
              return { code: imageCode }
            }
          }
        }
      }

      let insertResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .insert()
        .into(StaffTranslation)
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

  createFullStaffTranslations = async ({
    barnahusId,
    name,
    translations,
    images,
    deletedImages
  }: ICreateFullStaffTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { staffId, code: staffCode } = await this.staffService.createStaff({
        barnahusId,
        name,
        queryRunner
      })
      if (!staffId) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: staffCode }
      }

      const mappedTranslations = translations.map(
        ({ languageId, title, description, status }) => ({
          staffId,
          languageId,
          title,
          description,
          status
        })
      )

      let insertResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .insert()
        .into(StaffTranslation)
        .values(mappedTranslations)
        .execute()

      if (insertResult.raw.affectedRows !== mappedTranslations.length) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          staffId,
          mediaId: image
        }))

        const { code: imageCode } = await this.staffService.addStaffImages({
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
          const { code: imageCode } = await this.staffService.deleteStaffImage({
            staffImageId: image
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

      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  changeStaffTranslationStatus = async ({
    staffTranslationId,
    status,
    queryRunner
  }: IChangeStaffTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const staffTranslationEditResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .update(StaffTranslation)
        .set({
          status
        })
        .where('id = :staffTranslationId', { staffTranslationId })
        .execute()

      if (staffTranslationEditResult.affected !== 1) {
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

  bulkChangeStaffTranslationStatus = async ({
    barnahusId,
    languageId,
    status
  }: IBulkChangeStaffTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      const {
        staffData: staffTranslationData,
        code: staffTranslationDataCode
      } = await this.getStaffTranslations({
        barnahusId,
        languageId,
        page: 1,
        limit: 1000
      })
      if (!staffTranslationData) {
        return { code: staffTranslationDataCode }
      }

      const mappedStaffIds = staffTranslationData.staffTranslations.map(
        (staff) => staff.staffId
      )

      const staffTranslationEditResult = await this.staffTranslationRepository
        .createQueryBuilder('staffTranslation', queryRunner)
        .update(StaffTranslation)
        .set({
          status
        })
        .where('staffId IN (:...staffIds)', {
          staffIds: mappedStaffIds
        })
        .andWhere('languageId = :languageId', { languageId })
        .execute()

      if (staffTranslationEditResult.affected !== mappedStaffIds.length) {
        return { code: ResponseCode.FAILED_EDIT }
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
