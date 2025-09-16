import { ResponseCode } from '../../interface'
import {
  IAddStaffImages,
  IBulkDeleteStaff,
  ICreateStaff,
  IDeleteStaff,
  IDeleteStaffImage,
  IEditStaff,
  IGetStaff,
  IGetStaffImages,
  IRemoveUnusedStaff,
  IStaffImageLimited,
  IStaffLimited,
  IStaffService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { MediaService } from '../media/mediaService'
import { getSignedURL } from '../../services/google'
import { Repository } from 'typeorm'
import { Staff } from './staffModel'
import { StaffImage } from './staffImageModel'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class StaffService implements IStaffService {
  private readonly staffRepository: Repository<Staff>
  private readonly staffImageRepository: Repository<StaffImage>
  private readonly mediaService: MediaService

  constructor(mediaService: MediaService) {
    this.staffRepository = AppDataSource.manager.getRepository(Staff)
    this.staffImageRepository = AppDataSource.manager.getRepository(StaffImage)
    this.mediaService = mediaService
  }

  createStaff = async ({ name, barnahusId, queryRunner }: ICreateStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let insertResult = await this.staffRepository
        .createQueryBuilder('staff', queryRunner)
        .insert()
        .into(Staff)
        .values([
          {
            name,
            barnahusId
          }
        ])
        .execute()
      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }

      return { staffId: insertResult.identifiers[0].id as string, code }
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

  addStaffImages = async ({ images, queryRunner }: IAddStaffImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      if (images.length == 0) {
        return { code }
      }
      
      let insertResult = await this.staffImageRepository
        .createQueryBuilder('staffImage', queryRunner)
        .insert()
        .into(StaffImage)
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

  getStaffImages = async ({ staffId, signUrl = true }: IGetStaffImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let staffImages = await this.staffImageRepository
        .createQueryBuilder('staffImage')
        .leftJoinAndSelect('staffImage.media', 'media')
        .where('staffImage.staffId = :staffId', { staffId })
        .getMany()

      let staffImagesLimited: IStaffImageLimited[] = []

      for (let image of staffImages) {
        staffImagesLimited.push({
          staffImageId: image.id,
          mediaId: image.mediaId,
          url: signUrl
            ? (await getSignedURL(image.media.url)) || image.media.url
            : image.media.url
        })
      }

      return { staffImages: staffImagesLimited, code }
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

  deleteStaffImage = async ({ staffImageId }: IDeleteStaffImage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let staffImage = await this.staffImageRepository
        .createQueryBuilder('staffImage')
        .where('id = :staffImageId', { staffImageId })
        .getOne()
      if (!staffImage) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      const { code } = await this.mediaService.deleteMedia({
        mediaId: staffImage.mediaId
      })

      await this.staffImageRepository
        .createQueryBuilder('staffImage')
        .delete()
        .where('id = :staffImageId', { staffImageId })
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

  deleteStaff = async ({ staffId, queryRunner }: IDeleteStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let staff = await this.staffRepository
        .createQueryBuilder('staff', queryRunner)
        .where('id = :staffId', { staffId })
        .getOne()
      if (!staff) {
        return { code: ResponseCode.STAFF_NOT_FOUND }
      }

      const deleteResult = await this.staffRepository
        .createQueryBuilder('staff', queryRunner)
        .delete()
        .from(Staff)
        .where('id = :staffId', { staffId })
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

  bulkDeleteStaff = async ({ staffIds }: IBulkDeleteStaff) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const staffId of staffIds) {
        const deleteResult = await this.deleteStaff({ staffId, queryRunner })

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

  editStaff = async ({ staffId, name, queryRunner }: IEditStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const staffTranslationEditResult = await this.staffRepository
        .createQueryBuilder('staff', queryRunner)
        .update(Staff)
        .set({
          name
        })
        .where('id = :staffId', { staffId })
        .execute()

      if (staffTranslationEditResult.affected !== 1) {
        return { code: ResponseCode.FAILED_EDIT }
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

  getStaff = async ({ barnahusId, page, limit }: IGetStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.staffRepository
        .createQueryBuilder('staff')
        .where('staff.barnahusId = :barnahusId', { barnahusId })

      page = page || 1
      const offset = limit && page ? (page - 1) * limit : 0
      const [staff, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      const staffLimited: IStaffLimited[] = staff.map((x) => {
        return {
          staffId: x.id,
          barnahusId: x.barnahusId
        }
      })

      return {
        staffData: {
          staff: staffLimited,
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

  removeUnusedStaff = async ({ barnahusId }: IRemoveUnusedStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const staffWithoutTranslations = await this.staffRepository
        .createQueryBuilder('staff')
        .leftJoin('staff.staffTranslations', 'staffTranslation')
        .where('staffTranslation.staffId IS NULL')
        .andWhere('staff.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (staffWithoutTranslations.length === 0) {
        return { code }
      }

      await this.staffRepository
        .createQueryBuilder('staff')
        .delete()
        .from(Staff)
        .where('staff.id IN (:...staffIds)', {
          staffIds: staffWithoutTranslations.map((x) => x.id)
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
