import { ResponseCode } from '../../interface'
import {
  IAssignUserRoleBarnahus,
  IBulkDeleteUserRoleBarnahuses,
  IDeleteUserRoleBarnahus,
  IEditUserRoleBarnahus,
  IGetUserBarnahusIdsByUserIdAndRole,
  IGetUserRoleBarnahus,
  IGetUserRoleBarnahuses,
  IGetUserRoleBarnahusesByUserId,
  IGetUserRoleBarnahusesByUserRole,
  IUserRoleBarnahusService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { UserRoleBarnahus } from './userRoleBarnahusModel'
import { RoleType } from '../role/interface'
import { UserRoleService } from '../user_role/userRoleService'
import { autoInjectable } from 'tsyringe'
import { EmailTemplateService } from '../email_template/emailTemplateService'
import { UserService } from '../user/userService'
import { EmailTemplates } from '../email_template/interface'

@autoInjectable()
export class UserRoleBarnahusService implements IUserRoleBarnahusService {
  private readonly userRoleBarnahusRepository: Repository<UserRoleBarnahus>
  private readonly emailTemplateService: EmailTemplateService
  private readonly userService: UserService
  private readonly userRoleService: UserRoleService

  constructor(
    userRoleService: UserRoleService,
    emailTemplateService: EmailTemplateService,
    userService: UserService
  ) {
    this.userRoleBarnahusRepository =
      AppDataSource.manager.getRepository(UserRoleBarnahus)
    this.userRoleService = userRoleService
    this.emailTemplateService = emailTemplateService
    this.userService = userService
  }

  assignUserRoleToBarnahus = async ({
    userId,
    role,
    barnahusId,
    assignedById,
    sendEmail,
    userProfession,
    queryRunner
  }: IAssignUserRoleBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRole, code } = await this.userRoleService.getUserRole({
        userId,
        role,
        queryRunner
      })
      if (!userRole) {
        return { code }
      }

      const insertResult = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .insert()
        .into(UserRoleBarnahus)
        .values([
          { barnahusId, userRoleId: userRole.id, assignedById, userProfession }
        ])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (sendEmail) {
        const { user, code } = await this.userService.getUserById({
          userId,
          allUsers: true,
          queryRunner
        })
        if (!user) {
          return { code }
        }

        const { userRoleBarnahus, code: userRoleBarnahusCode } =
          await this.getUserRoleBarnahus({
            userId,
            role,
            barnahusId,
            queryRunner
          })
        if (!userRoleBarnahus) {
          return { code: userRoleBarnahusCode }
        }

        await this.emailTemplateService.sendEmail({
          to: user.email,
          template: EmailTemplates.BARNAHUS_ASSIGNMENT,
          data: {
            BARNAHUS: userRoleBarnahus.barnahus.name,
            ROLE: userRole.role.name
          }
        })
      }

      return { userRole, code }
    } catch (err: any) {
      switch (err.name) {
        case 'QueryFailedError':
          code = ResponseCode.CONFLICT_USER_ROLE
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

  getUserRoleBarnahuses = async ({
    userId,
    roles,
    barnahusId,
    queryRunner
  }: IGetUserRoleBarnahuses) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      if (roles.length == 0) {
        return { code: ResponseCode.INVALID_INPUT }
      }

      const userRoleBarnahuses = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('userRoleBarnahus.barnahus', 'barnahus')
        .where('role.name IN (:roles)', { roles })
        .andWhere('userRole.userId = :userId', { userId })
        .andWhere('userRoleBarnahus.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (!userRoleBarnahuses) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userRoleBarnahuses, code }
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

  getUserRoleBarnahus = async ({
    userId,
    role,
    barnahusId,
    queryRunner
  }: IGetUserRoleBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRoleBarnahus = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('userRoleBarnahus.barnahus', 'barnahus')
        .where('role.name = :roleName', { roleName: role })
        .andWhere('userRole.userId = :userId', { userId })
        .andWhere('userRoleBarnahus.barnahusId = :barnahusId', { barnahusId })
        .getOne()

      if (!userRoleBarnahus) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userRoleBarnahus, code }
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

  editUserRoleBarnahus = async ({
    userId,
    role,
    userRoleBarnahusId,
    userProfession,
    queryRunner
  }: IEditUserRoleBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRole, code: userRoleCode } =
        await this.userRoleService.getUserRole({
          userId,
          role
        })
      if (!userRole) {
        return { code: userRoleCode }
      }

      const userRoleBarnahus = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .where('id = :userRoleBarnahusId', { userRoleBarnahusId })
        .getOne()

      if (!userRoleBarnahus) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const userRoleBarnahusEditResult = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .update(UserRoleBarnahus)
        .set({
          userRoleId: userRole.id,
          userProfession
        })
        .where('id = :userRoleBarnahusId', { userRoleBarnahusId })
        .execute()

      if (userRoleBarnahusEditResult.affected !== 1) {
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

  getUserRoleBarnahusesByRole = async ({
    role,
    barnahusId
  }: IGetUserRoleBarnahusesByUserRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRoleBarnahuses = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('role.name = :roleName', { roleName: role })
        .andWhere('userRoleBarnahus.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (!userRoleBarnahuses) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { userRoleBarnahuses, code }
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

  getUserRoleBarnahusesByUserRole = async ({
    userId,
    roleName
  }: IGetUserBarnahusIdsByUserIdAndRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userBarnahusRoles = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRoleBarnahus.barnahus', 'barnahus')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('userRole.userId = :userId', { userId })
        .andWhere('role.name IN (:roleName)', { roleName })
        .getMany()

      if (!userBarnahusRoles.length) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userBarnahusRoles, code }
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

  getUserRoleBarnahusesByUserId = async ({
    userId,
    barnahusId
  }: IGetUserRoleBarnahusesByUserId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRoleBarnahuses = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus')
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('userRole.userId = :userId', { userId })
        .andWhere('userRoleBarnahus.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (!userRoleBarnahuses) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userRoleBarnahuses, code }
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

  deleteUserRoleBarnahus = async ({
    userId,
    role,
    barnahusId,
    queryRunner
  }: IDeleteUserRoleBarnahus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRoleBarnahus = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .leftJoinAndSelect('userRoleBarnahus.userRole', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('role.name = :roleName', { roleName: role })
        .andWhere('userRole.userId = :userId', { userId })
        .andWhere('userRoleBarnahus.barnahusId = :barnahusId', { barnahusId })
        .getOne()

      if (!userRoleBarnahus) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      const deleteResult = await this.userRoleBarnahusRepository
        .createQueryBuilder('userRoleBarnahus', queryRunner)
        .delete()
        .from(UserRoleBarnahus)
        .where('id = :userRoleBarnahusId', {
          userRoleBarnahusId: userRoleBarnahus.id
        })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }

      const { userRoleBarnahuses } = await this.getUserRoleBarnahusesByRole({
        role,
        barnahusId
      })
      if (!userRoleBarnahuses || userRoleBarnahuses.length < 1) {
        //Remove role if the role is no longer used
        if (role != RoleType.MASTER_ADMIN && role != RoleType.SUPER_ADMIN) {
          await this.userRoleService.deleteUserRole({
            userId,
            role,
            queryRunner
          })
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

  bulkDeleteUserRoleBarnahuses = async ({
    userIds,
    role,
    barnahusId
  }: IBulkDeleteUserRoleBarnahuses) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const userId of userIds) {
        const { userRoleBarnahus } = await this.getUserRoleBarnahus({
          userId,
          role,
          barnahusId
        })
        if (!userRoleBarnahus) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: ResponseCode.FORBIDDEN }
        }

        const { code: deleteCode } = await this.deleteUserRoleBarnahus({
          userId,
          role,
          barnahusId,
          queryRunner
        })

        if (code != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code: deleteCode }
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
