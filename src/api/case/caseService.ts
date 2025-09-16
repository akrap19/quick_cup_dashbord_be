import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICaseService,
  ICreateCase,
  IGetCases,
  IGetCaseByCustomId,
  ICheckCaseByCustomId,
  IEditCase,
  IBulkDeleteCases,
  IDeleteCase,
  IGetCase,
  ISetCaseContent,
  ICreateCaseAbout,
  ICreateCaseRoom,
  ICreateCaseStaff,
  IGetCaseStaff,
  IGetCaseAbouts,
  IGetCaseRooms,
  ISearchCases,
  ICheckCanAddNotes,
  IChangeCasePassword
} from './interface'
import { Brackets, Repository } from 'typeorm'
import { Case } from './caseModel'
import { autoInjectable } from 'tsyringe'
import { CaseAbout } from './caseAboutModel'
import { CaseAboutImage } from './caseAboutImageModel'
import { CaseRoom } from './caseRoomModel'
import { CaseRoomImage } from './caseRoomImageModel'
import { CaseStaff } from './caseStaffModel'
import { CaseStaffImage } from './caseStaffImageModel'
import { NoteType } from '../note/interface'
import { compare, hashString } from '../../services/bcrypt'
import config from '../../config'

@autoInjectable()
export class CaseService implements ICaseService {
  private readonly caseRepository: Repository<Case>
  private readonly caseAboutRepository: Repository<CaseAbout>
  private readonly caseAboutImageRepository: Repository<CaseAboutImage>
  private readonly caseRoomRepository: Repository<CaseRoom>
  private readonly caseRoomImageRepository: Repository<CaseRoomImage>
  private readonly caseStaffRepository: Repository<CaseStaff>
  private readonly caseStaffImageRepository: Repository<CaseStaffImage>

  constructor() {
    this.caseRepository = AppDataSource.manager.getRepository(Case)
    this.caseAboutRepository = AppDataSource.manager.getRepository(CaseAbout)
    this.caseAboutImageRepository =
      AppDataSource.manager.getRepository(CaseAboutImage)
    this.caseRoomRepository = AppDataSource.manager.getRepository(CaseRoom)
    this.caseRoomImageRepository =
      AppDataSource.manager.getRepository(CaseRoomImage)
    this.caseStaffRepository = AppDataSource.manager.getRepository(CaseStaff)
    this.caseStaffImageRepository =
      AppDataSource.manager.getRepository(CaseStaffImage)
  }

  createCase = async ({
    customId,
    barnahusId,
    status,
    canAddNotes,
    password,
    shouldChangePassword = false
  }: ICreateCase) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const hashedPassword = await hashString(
        password || config.DEFAULT_CASE_PASSWORD
      )

      let insertResult = await this.caseRepository
        .createQueryBuilder()
        .insert()
        .into(Case)
        .values([
          {
            customId,
            barnahusId,
            status,
            canAddNotes,
            password: hashedPassword,
            shouldChangePassword
          }
        ])
        .execute()
      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }

      return { caseId: insertResult.identifiers[0].id, code }
    } catch (err: any) {
      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_CUSTOM_ID
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

  getCases = async ({ barnahusId, search, page, limit }: IGetCases) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const searchLike = '%' + search + '%'

      let query = this.caseRepository
        .createQueryBuilder('case')
        .leftJoinAndSelect('case.barnahus', 'barnahus')
        .leftJoinAndSelect('case.template', 'template')
        .leftJoinAndSelect('case.language', 'language')
        .where('barnahus.id = :barnahusId', { barnahusId })

      if (search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.orWhere('case.customId LIKE :customId', {
              customId: searchLike
            })
          })
        )
      }

      const offset = (page - 1) * limit
      const [cases, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!cases) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return {
        caseData: {
          cases,
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

  searchCases = async ({ barnahusId, search, status }: ISearchCases) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const searchLike = '%' + search + '%'

      let query = this.caseRepository
        .createQueryBuilder('case')
        .leftJoinAndSelect('case.barnahus', 'barnahus')
        .leftJoinAndSelect('case.template', 'template')
        .leftJoinAndSelect('case.language', 'language')
        .where('barnahus.id = :barnahusId', { barnahusId })

      if (status) {
        query.andWhere('case.status IN (:status)', {
          status
        })
      }

      if (search) {
        query.andWhere(
          new Brackets((qb) => {
            qb.orWhere('case.customId LIKE :customId', {
              customId: searchLike
            })
          })
        )
      }

      const cases = await query.getMany()

      if (!cases) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return {
        cases,
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

  getCase = async ({ caseId }: IGetCase) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let checkCase = await this.caseRepository
        .createQueryBuilder('case')
        .leftJoinAndSelect('case.barnahus', 'barnahus')
        .leftJoinAndSelect('case.template', 'template')
        .leftJoinAndSelect('case.language', 'language')
        .where('case.id = :caseId', { caseId })
        .getOne()

      if (!checkCase) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return { case: checkCase, code }
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

  checkCaseByCustomId = async ({ customId }: ICheckCaseByCustomId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const checkCase = await this.caseRepository.findOne({
        where: { customId }
      })

      if (!checkCase) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return { case: checkCase, code }
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

  getCaseByCustomId = async ({ customId }: IGetCaseByCustomId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const checkCase = await this.caseRepository.findOne({
        where: { customId }
      })

      if (!checkCase) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return { case: checkCase, code }
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

  editCase = async ({ caseId, customId, canAddNotes, password, shouldChangePassword }: IEditCase) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const caseToEdit = await this.caseRepository.findOne({
        where: { id: caseId }
      })

      if (!caseToEdit) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      if (customId) {
        caseToEdit.customId = customId
      }

      if (canAddNotes != undefined) {
        caseToEdit.canAddNotes = canAddNotes
      }

      if (password) {
        caseToEdit.password = await hashString(password)
        caseToEdit.shouldChangePassword = false
      }

      if(shouldChangePassword) {
        caseToEdit.shouldChangePassword = shouldChangePassword
      }

      await this.caseRepository.save(caseToEdit)
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

  setCaseContent = async ({
    caseId,
    languageId,
    templateId,
    queryRunner
  }: ISetCaseContent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const caseToEdit = await this.caseRepository.findOne({
        where: { id: caseId }
      })

      if (!caseToEdit) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      const caseEditResult = await this.caseRepository
        .createQueryBuilder('case', queryRunner)
        .update(Case)
        .set({
          languageId,
          templateId
        })
        .where('case.id = :caseId', { caseId })
        .execute()

      if (caseEditResult.affected !== 1) {
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

  deleteCase = async ({ caseId, queryRunner }: IDeleteCase) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const deleteResult = await this.caseRepository
        .createQueryBuilder('case', queryRunner)
        .delete()
        .from(Case)
        .where('id = :caseId', { caseId })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
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

  bulkDeleteCases = async ({ caseIds }: IBulkDeleteCases) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const caseId of caseIds) {
        const deleteResult = await this.deleteCase({ caseId, queryRunner })

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

  createCaseAbout = async ({
    caseId,
    orderNumber,
    title,
    description,
    audioId,
    aboutImages,
    queryRunner
  }: ICreateCaseAbout) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseAboutResult = await this.caseAboutRepository
        .createQueryBuilder('caseAbout', queryRunner)
        .insert()
        .into(CaseAbout)
        .values([
          {
            caseId,
            orderNumber,
            title,
            description,
            audioId
          }
        ])
        .execute()
      if (caseAboutResult.raw.affectedRows !== 1) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (aboutImages && aboutImages.length > 0) {
        const mappedImages = aboutImages.map((image) => ({
          caseAboutId: caseAboutResult.identifiers[0].id,
          mediaId: image.mediaId
        }))

        let caseAboutImageResult = await this.caseAboutImageRepository
          .createQueryBuilder('caseAboutImage', queryRunner)
          .insert()
          .into(CaseAboutImage)
          .values(mappedImages)
          .execute()
        if (caseAboutImageResult.raw.affectedRows !== mappedImages.length) {
          return { code: ResponseCode.FAILED_INSERT }
        }
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

  createCaseRoom = async ({
    caseId,
    orderNumber,
    title,
    description,
    audioId,
    roomImages,
    queryRunner
  }: ICreateCaseRoom) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseRoomResult = await this.caseRoomRepository
        .createQueryBuilder('caseRoom', queryRunner)
        .insert()
        .into(CaseRoom)
        .values([
          {
            caseId,
            orderNumber,
            title,
            description,
            audioId
          }
        ])
        .execute()
      if (caseRoomResult.raw.affectedRows !== 1) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (roomImages && roomImages.length > 0) {
        const mappedImages = roomImages.map((image) => ({
          caseRoomId: caseRoomResult.identifiers[0].id,
          mediaId: image.mediaId
        }))

        let caseRoomImageResult = await this.caseRoomImageRepository
          .createQueryBuilder('caseRoomImage', queryRunner)
          .insert()
          .into(CaseRoomImage)
          .values(mappedImages)
          .execute()
        if (caseRoomImageResult.raw.affectedRows !== mappedImages.length) {
          return { code: ResponseCode.FAILED_INSERT }
        }
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

  createCaseStaff = async ({
    caseId,
    orderNumber,
    name,
    title,
    description,
    staffImages,
    queryRunner
  }: ICreateCaseStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseStaffResult = await this.caseStaffRepository
        .createQueryBuilder('caseStaff', queryRunner)
        .insert()
        .into(CaseStaff)
        .values([
          {
            caseId,
            orderNumber,
            name,
            title,
            description
          }
        ])
        .execute()
      if (caseStaffResult.raw.affectedRows !== 1) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (staffImages && staffImages.length > 0) {
        const mappedImages = staffImages.map((image) => ({
          caseStaffId: caseStaffResult.identifiers[0].id,
          mediaId: image.mediaId
        }))

        let caseStaffImageResult = await this.caseStaffImageRepository
          .createQueryBuilder('caseStaffImage', queryRunner)
          .insert()
          .into(CaseStaffImage)
          .values(mappedImages)
          .execute()
        if (caseStaffImageResult.raw.affectedRows !== mappedImages.length) {
          return { code: ResponseCode.FAILED_INSERT }
        }
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

  getCaseAbouts = async ({ caseId }: IGetCaseAbouts) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseAbouts = await this.caseAboutRepository
        .createQueryBuilder('caseAbout')
        .leftJoinAndSelect('caseAbout.caseAboutImages', 'caseAboutImage')
        .leftJoinAndSelect('caseAboutImage.media', 'media')
        .leftJoinAndSelect('caseAbout.audio', 'audio')
        .leftJoinAndSelect('caseAbout.case', 'case')
        .where('case.id = :caseId', { caseId })
        .getMany()

      return { caseAbouts, code }
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

  getCaseRooms = async ({ caseId }: IGetCaseRooms) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseRooms = await this.caseRoomRepository
        .createQueryBuilder('caseRoom')
        .leftJoinAndSelect('caseRoom.caseRoomImages', 'caseRoomImage')
        .leftJoinAndSelect('caseRoomImage.media', 'media')
        .leftJoinAndSelect('caseRoom.audio', 'audio')
        .leftJoinAndSelect('caseRoom.case', 'case')
        .where('case.id = :caseId', { caseId })
        .getMany()

      return { caseRooms, code }
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

  getCaseStaff = async ({ caseId }: IGetCaseStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let caseStaff = await this.caseStaffRepository
        .createQueryBuilder('caseStaff')
        .leftJoinAndSelect('caseStaff.caseStaffImages', 'caseStaffImage')
        .leftJoinAndSelect('caseStaffImage.media', 'media')
        .leftJoinAndSelect('caseStaff.case', 'case')
        .where('case.id = :caseId', { caseId })
        .getMany()

      return { caseStaff, code }
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

  checkCanAddNotes = async ({ contentId, type }: ICheckCanAddNotes) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let foundCase = false
      let canAddNotes = false
      if (type == NoteType.ABOUT) {
        let caseAbout = await this.caseAboutRepository.findOne({
          where: { id: contentId },
          relations: ['case']
        })

        if (caseAbout) {
          foundCase = true
          canAddNotes = caseAbout.case.canAddNotes
        }
      }

      if (type == NoteType.ROOM) {
        let caseRoom = await this.caseRoomRepository.findOne({
          where: { id: contentId },
          relations: ['case']
        })

        if (caseRoom) {
          foundCase = true
          canAddNotes = caseRoom.case.canAddNotes
        }
      }

      if (type == NoteType.STAFF) {
        let caseStaff = await this.caseStaffRepository.findOne({
          where: { id: contentId },
          relations: ['case']
        })

        if (caseStaff) {
          foundCase = true
          canAddNotes = caseStaff.case.canAddNotes
        }
      }

      if (!foundCase) {
        return { code: ResponseCode.CASE_NOT_FOUND }
      }

      return {
        canAddNotes,
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

  changeCasePassword = async ({
    caseId,
    password,
    newPassword
  }: IChangeCasePassword) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { case: userCase, code: caseCode } = await this.getCase({ caseId })

      if (!userCase) {
        return { code: caseCode }
      }

      const matches = await compare(password, userCase.password)
      if (!matches) {
        return { code: ResponseCode.WRONG_PASSWORD }
      }

      const hashedPassword = await hashString(newPassword)

      let caseEditResult = await this.caseRepository
        .createQueryBuilder()
        .update(Case)
        .set({ password: hashedPassword, shouldChangePassword: false })
        .where('id = :caseId', { caseId })
        .execute()

      if (caseEditResult.affected !== 1) {
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
}
