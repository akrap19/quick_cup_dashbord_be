import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ITemplateService,
  ICreateTemplate,
  IGetTemplates,
  IEditTemplate,
  IBulkDeleteTemplates,
  IDeleteTemplate,
  IGetTemplate,
  TemplateStatus,
  ICreateTemplateStaff,
  ICreateTemplateAbouts,
  ICreateTemplateRooms,
  IGetTemplateByName
} from './interface'
import { Repository } from 'typeorm'
import { Template } from './templateModel'
import { TemplateRoom } from './templateRoomModel'
import { TemplateAbout } from './templateAboutModel'
import { TemplateStaff } from './templateStaffModel'
import { autoInjectable } from 'tsyringe'
import { UserStatus } from '../user/interface'

@autoInjectable()
export class TemplateService implements ITemplateService {
  private readonly templateRepository: Repository<Template>
  private readonly templateRoomRepository: Repository<TemplateRoom>
  private readonly templateAboutRepository: Repository<TemplateAbout>
  private readonly templateStaffRepository: Repository<TemplateStaff>

  constructor() {
    this.templateRepository = AppDataSource.manager.getRepository(Template)
    this.templateRoomRepository =
      AppDataSource.manager.getRepository(TemplateRoom)
    this.templateAboutRepository =
      AppDataSource.manager.getRepository(TemplateAbout)
    this.templateStaffRepository =
      AppDataSource.manager.getRepository(TemplateStaff)
  }

  createTemplate = async ({
    barnahusId,
    name,
    isGeneral,
    password,
    rooms,
    abouts,
    staff,
    addedById
  }: ICreateTemplate) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      let existingTemplate = await this.templateRepository.findOne({
        where: { name, barnahusId }
      })
      if (existingTemplate) {
        return { code: ResponseCode.CONFLICT_DUPLICATE_TEMPLATE }
      }

      const insertTemplateResult = await this.templateRepository
        .createQueryBuilder('template', queryRunner)
        .insert()
        .into(Template)
        .values([
          {
            barnahusId,
            name,
            isGeneral,
            password,
            status: TemplateStatus.PUBLISHED,
            addedById
          }
        ])
        .execute()

      if (insertTemplateResult.raw.affectedRows !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      const templateId = insertTemplateResult.identifiers[0].id

      let mappedAbouts = abouts
        .filter(
          (about) =>
            about.includeAudio ||
            about.includeDescription ||
            about.includeImages
        )
        .map((about) => {
          return {
            templateId,
            aboutId: about.aboutId,
            includeAudio: about.includeAudio,
            includeDescription: about.includeDescription,
            includeImages: about.includeImages
          }
        })

      if (mappedAbouts.length > 0) {
        const { code: aboutCode } = await this.createTemplateAbouts({
          abouts: mappedAbouts,
          queryRunner
        })

        if (aboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: aboutCode }
        }
      }

      let mappedRooms = rooms
        .filter(
          (room) =>
            room.includeAudio || room.includeDescription || room.includeImages
        )
        .map((room) => {
          return {
            templateId,
            roomId: room.roomId,
            includeAudio: room.includeAudio,
            includeDescription: room.includeDescription,
            includeImages: room.includeImages,
            orderNumber: room.orderNumber
          }
        })

      if (mappedRooms.length > 0) {
        const { code: roomCode } = await this.createTemplateRooms({
          rooms: mappedRooms,
          queryRunner
        })

        if (roomCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: roomCode }
        }
      }

      let mappedStaff = staff
        .filter(
          (staffMember) =>
            staffMember.includeName ||
            staffMember.includeDescription ||
            staffMember.includeImages
        )
        .map((staffMember) => {
          return {
            templateId,
            staffId: staffMember.staffId,
            includeName: staffMember.includeName,
            includeDescription: staffMember.includeDescription,
            includeImages: staffMember.includeImages
          }
        })

      if (mappedStaff.length > 0) {
        const { code: staffCode } = await this.createTemplateStaff({
          staff: mappedStaff,
          queryRunner
        })

        if (staffCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: staffCode }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return { code }
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

  createTemplateAbouts = async ({
    abouts,
    queryRunner
  }: ICreateTemplateAbouts) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const insertTemplateAboutResult = await this.templateAboutRepository
        .createQueryBuilder('templateAbout', queryRunner)
        .insert()
        .into(TemplateAbout)
        .values(abouts)
        .execute()

      if (insertTemplateAboutResult.raw.affectedRows !== abouts.length) {
        return { code: ResponseCode.FAILED_INSERT }
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

  createTemplateRooms = async ({
    rooms,
    queryRunner
  }: ICreateTemplateRooms) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const insertTemplateRoomResult = await this.templateRoomRepository
        .createQueryBuilder('templateRoom', queryRunner)
        .insert()
        .into(TemplateRoom)
        .values(rooms)
        .execute()

      if (insertTemplateRoomResult.raw.affectedRows !== rooms.length) {
        return { code: ResponseCode.FAILED_INSERT }
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

  createTemplateStaff = async ({
    staff,
    queryRunner
  }: ICreateTemplateStaff) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const insertTemplateStaffResult = await this.templateStaffRepository
        .createQueryBuilder('templateStaff', queryRunner)
        .insert()
        .into(TemplateStaff)
        .values(staff)
        .execute()

      if (insertTemplateStaffResult.raw.affectedRows !== staff.length) {
        return { code: ResponseCode.FAILED_INSERT }
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

  getTemplates = async ({ page, limit, search, barnahusId }: IGetTemplates) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.templateRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.barnahus', 'barnahus')
        .leftJoinAndSelect('template.cases', 'case')
        .leftJoinAndSelect('template.addedBy', 'addedBy')
        .where('template.barnahusId = :barnahusId', { barnahusId })

      if (search) {
        const searchLike = `%${search}%`

        query.andWhere('template.name LIKE :name', {
          name: searchLike
        })
      }

      const offset = (page - 1) * limit
      const [templates, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!templates) {
        return { code: ResponseCode.TEMPLATE_NOT_FOUND }
      }

      return {
        templateData: {
          templates,
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

  getTemplate = async ({ templateId }: IGetTemplate) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const template = await this.templateRepository.findOne({
        where: { id: templateId },
        relations: ['addedBy']
      })
      if (!template) {
        return { code: ResponseCode.TEMPLATE_NOT_FOUND }
      }

      const addedBy = template.addedBy
        ? `${template.addedBy.firstName} ${template.addedBy.lastName} ${template.addedBy.status == UserStatus.DELETED ? '[deleted]' : ''}`
        : null

      return {
        template: {
          templateId: template.id,
          addedBy,
          name: template.name,
          isGeneral: template.isGeneral,
          password: template.password,
          status: template.status,
          updated: template.updatedAt,
          hasCases: template.cases?.length > 0,
          abouts: template.templateAbouts
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((about) => {
              return {
                templateAboutId: about.id,
                aboutId: about.aboutId,
                includeDescription: about.includeDescription,
                includeImages: about.includeImages,
                includeAudio: about.includeAudio
              }
            }),
          rooms: template.templateRooms
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((room) => {
              return {
                templateRoomId: room.id,
                roomId: room.roomId,
                includeDescription: room.includeDescription,
                includeImages: room.includeImages,
                includeAudio: room.includeAudio,
                orderNumber: room.orderNumber
              }
            }),
          staff: template.templateStaff
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
            .map((staff) => {
              return {
                templateStaffId: staff.id,
                staffId: staff.staffId,
                includeName: staff.includeName,
                includeDescription: staff.includeDescription,
                includeImages: staff.includeImages
              }
            })
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

  getTemplateByName = async ({ name }: IGetTemplateByName) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const template = await this.templateRepository.findOne({
        where: { name }
      })
      if (!template) {
        return { code: ResponseCode.TEMPLATE_NOT_FOUND }
      }

      return {
        template,
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

  editTemplate = async ({
    templateId,
    name,
    isGeneral,
    abouts,
    rooms,
    staff,
    deleteAbouts,
    deleteRooms,
    deleteStaff
  }: IEditTemplate) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const templateToEdit = await this.templateRepository.findOne({
        where: { id: templateId }
      })

      if (!templateToEdit) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.TEMPLATE_NOT_FOUND }
      }

      let existingTemplate = await this.templateRepository.findOne({
        where: { name, barnahusId: templateToEdit.barnahusId }
      })
      if (existingTemplate) {
        return { code: ResponseCode.CONFLICT_DUPLICATE_TEMPLATE }
      }

      const templateResult = await this.templateRepository
        .createQueryBuilder('template', queryRunner)
        .update(Template)
        .set({
          name,
          isGeneral
        })
        .where('template.id = :templateId', { templateId })
        .execute()

      if (templateResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      const newAbouts = abouts
        .filter((about) => !about.templateAboutId)
        .filter(
          (about) =>
            about.includeAudio ||
            about.includeDescription ||
            about.includeImages
        )
        .map((about) => {
          return {
            templateId,
            aboutId: about.aboutId,
            includeAudio: about.includeAudio,
            includeDescription: about.includeDescription,
            includeImages: about.includeImages
          }
        })

      if (newAbouts.length > 0) {
        const { code: createTemplateAboutCode } =
          await this.createTemplateAbouts({
            abouts: newAbouts,
            queryRunner
          })

        if (createTemplateAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createTemplateAboutCode }
        }
      }

      const editedAbouts = abouts.filter((about) => about.templateAboutId)
      for (let about of editedAbouts) {
        const {
          templateAboutId,
          aboutId,
          includeAudio,
          includeDescription,
          includeImages
        } = about

        if (!includeAudio && !includeDescription && !includeImages) {
          const deleteResult = await this.templateAboutRepository
            .createQueryBuilder('templateAbout', queryRunner)
            .delete()
            .from(TemplateAbout)
            .where('id = :templateAboutId', { templateAboutId })
            .execute()

          if (deleteResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.GONE }
          }

          continue
        } else {
          const templateAboutResult = await this.templateAboutRepository
            .createQueryBuilder('templateAbout', queryRunner)
            .update(TemplateAbout)
            .set({
              aboutId,
              includeAudio,
              includeDescription,
              includeImages
            })
            .where('templateAbout.id = :templateAboutId', { templateAboutId })
            .execute()

          if (templateAboutResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.FAILED_INSERT }
          }
        }
      }

      if (deleteAbouts.length > 0) {
        const deleteResult = await this.templateAboutRepository
          .createQueryBuilder('templateAbout', queryRunner)
          .delete()
          .from(TemplateAbout)
          .where('id IN (:templateAboutIds)', {
            templateAboutIds: deleteAbouts
          })
          .execute()

        if (deleteResult.affected !== deleteAbouts.length) {
          return { code: ResponseCode.GONE }
        }
      }

      const newRooms = rooms
        .filter((room) => !room.templateRoomId)
        .filter(
          (room) =>
            room.includeAudio || room.includeDescription || room.includeImages
        )
        .map((room) => {
          return {
            templateId,
            roomId: room.roomId,
            includeDescription: room.includeDescription,
            includeAudio: room.includeAudio,
            includeImages: room.includeImages,
            orderNumber: room.orderNumber
          }
        })

      if (newRooms.length > 0) {
        const { code: createTemplateRoomCode } = await this.createTemplateRooms(
          {
            rooms: newRooms,
            queryRunner
          }
        )

        if (createTemplateRoomCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createTemplateRoomCode }
        }
      }

      const editedRooms = rooms.filter((rooms) => rooms.templateRoomId)
      for (let room of editedRooms) {
        const {
          templateRoomId,
          roomId,
          includeAudio,
          includeDescription,
          includeImages,
          orderNumber
        } = room

        if (!includeAudio && !includeDescription && !includeImages) {
          const deleteResult = await this.templateRoomRepository
            .createQueryBuilder('templateRoom', queryRunner)
            .delete()
            .from(TemplateRoom)
            .where('id = :templateRoomId', { templateRoomId })
            .execute()

          if (deleteResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.GONE }
          }

          continue
        } else {
          const templateRoomResult = await this.templateRoomRepository
            .createQueryBuilder('templateRoom', queryRunner)
            .update(TemplateRoom)
            .set({
              roomId,
              includeAudio,
              includeDescription,
              includeImages,
              orderNumber
            })
            .where('templateRoom.id = :templateRoomId', { templateRoomId })
            .execute()

          if (templateRoomResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.FAILED_EDIT }
          }
        }
      }

      if (deleteRooms.length > 0) {
        const deleteResult = await this.templateRoomRepository
          .createQueryBuilder('templateRoom', queryRunner)
          .delete()
          .from(TemplateRoom)
          .where('id IN (:templateRoomIds)', { templateRoomIds: deleteRooms })
          .execute()

        if (deleteResult.affected !== deleteRooms.length) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.GONE }
        }
      }

      const newStaff = staff
        .filter((staffMember) => !staffMember.templateStaffId)
        .filter(
          (staffMember) =>
            staffMember.includeName ||
            staffMember.includeDescription ||
            staffMember.includeImages
        )
        .map((staffMember) => {
          return {
            templateId,
            staffId: staffMember.staffId,
            includeName: staffMember.includeName,
            includeDescription: staffMember.includeDescription,
            includeImages: staffMember.includeImages
          }
        })

      if (newStaff.length > 0) {
        const { code: createTemplateStaffCode } =
          await this.createTemplateStaff({
            staff: newStaff,
            queryRunner
          })

        if (createTemplateStaffCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createTemplateStaffCode }
        }
      }

      const editedStaff = staff.filter(
        (staffMember) => staffMember.templateStaffId
      )
      for (let staffMember of editedStaff) {
        const {
          templateStaffId,
          staffId,
          includeName,
          includeDescription,
          includeImages
        } = staffMember

        if (!includeName && !includeDescription && !includeImages) {
          const deleteResult = await this.templateStaffRepository
            .createQueryBuilder('templateStaff', queryRunner)
            .delete()
            .from(TemplateStaff)
            .where('id = :templateStaffId', { templateStaffId })
            .execute()

          if (deleteResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.GONE }
          }

          continue
        } else {
          const templateStaffResult = await this.templateStaffRepository
            .createQueryBuilder('templateStaff', queryRunner)
            .update(TemplateStaff)
            .set({
              staffId,
              includeName,
              includeDescription,
              includeImages
            })
            .where('templateStaff.id = :templateStaffId', { templateStaffId })
            .execute()

          if (templateStaffResult.affected !== 1) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: ResponseCode.FAILED_INSERT }
          }
        }
      }

      if (deleteStaff.length > 0) {
        const deleteResult = await this.templateStaffRepository
          .createQueryBuilder('templateStaff', queryRunner)
          .delete()
          .from(TemplateStaff)
          .where('id IN (:templateStaffIds)', { templateStaffIds: deleteStaff })
          .execute()

        if (deleteResult.affected !== deleteStaff.length) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.GONE }
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

  deleteTemplate = async ({ templateId, queryRunner }: IDeleteTemplate) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const deleteResult = await this.templateRepository
        .createQueryBuilder('template', queryRunner)
        .delete()
        .from(Template)
        .where('id = :templateId', { templateId })
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

  bulkDeleteTemplates = async ({ templateIds }: IBulkDeleteTemplates) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const templateId of templateIds) {
        const deleteResult = await this.deleteTemplate({
          templateId,
          queryRunner
        })

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
}
