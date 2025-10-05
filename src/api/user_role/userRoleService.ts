import { ResponseCode } from '../../interface'
import {
  IAssignRole,
  IBulkDeleteUserRoles,
  IDeleteUserRole,
  IGetUserRole,
  IGetUserRoles,
  IRevokeRole,
  IUserRoleService,
  IGetUserSpecificRole
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { UserRole } from './userRoleModel'
import { UserService } from '../user/userService'
import { RoleService } from '../role/roleService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class UserRoleService implements IUserRoleService {
  private readonly userRoleRepository: Repository<UserRole>

  private readonly userService: UserService
  private readonly roleService: RoleService

  constructor(userService: UserService, roleService: RoleService) {
    this.userRoleRepository = AppDataSource.manager.getRepository(UserRole)
    this.userService = userService
    this.roleService = roleService
  }

  assignRole = async ({
    userId,
    roleName,
    assignedById,
    queryRunner
  }: IAssignRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { user, code: userCode } = await this.userService.getUserById({
        userId,
        allUsers: true,
        queryRunner
      })
      if (!user) {
        return { code: userCode }
      }

      const { role, code: roleCode } = await this.roleService.getRole({
        roleName,
        queryRunner
      })
      if (!role) {
        return { code: roleCode }
      }

      await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .insert()
        .into(UserRole)
        .values([{ userId, roleId: role.id, assignedById }])
        .execute()

      const userRole = await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('role.name = :roleName', { roleName })
        .andWhere('user.id = :id', { id: user.id })
        .getOne()

      if (!userRole) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      return { code }
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

  revokeRole = async ({ userId, roleId }: IRevokeRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRole = await this.userRoleRepository.findOne({
        where: {
          userId,
          roleId
        }
      })
      if (!userRole) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      this.userRoleRepository.delete({ id: userRole.id })

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

  getUserRoles = async ({ userId, queryRunner }: IGetUserRoles) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let userRoles = await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .leftJoinAndSelect('userRole.user', 'user')
        .leftJoinAndSelect('userRole.role', 'role')
        .andWhere('user.id = :userId', { userId })
        .getMany()

      return { userRoles, code }
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

  getUserSpecificRoles = async ({
    userId,
    roles,
    queryRunner
  }: IGetUserSpecificRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRoles = await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .leftJoinAndSelect('userRole.role', 'role')
        .where('role.name IN (:roleNames)', { roleNames: roles })
        .andWhere('userRole.userId = :id', { id: userId })
        .getMany()

      if (!userRoles.length) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userRoles, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
      return { code }
    }
  }

  getUserRole = async ({ userId, role, queryRunner }: IGetUserRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const userRole = await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .leftJoinAndSelect('userRole.role', 'role')
        .leftJoinAndSelect('userRole.user', 'user')
        .where('role.name = :roleName', { roleName: role })
        .andWhere('userRole.userId = :id', { id: userId })
        .getOne()

      if (!userRole) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      return { userRole, code }
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

  deleteUserRole = async ({ userId, role, queryRunner }: IDeleteUserRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRole } = await this.getUserRole({ userId, role })
      if (!userRole) {
        return { code: ResponseCode.USER_ROLE_NOT_FOUND }
      }

      const deleteResult = await this.userRoleRepository
        .createQueryBuilder('userRole', queryRunner)
        .delete()
        .from(UserRole)
        .where('id = :userRoleId', { userRoleId: userRole.id })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }

      // check if there are any other roles assigned to the user
      const { userRoles } = await this.getUserRoles({
        userId,
        queryRunner
      })

      if (!userRoles || userRoles.length < 1) {
        // if user has no roles, anonymize him
        await this.userService.anonymizeUser({ userId, queryRunner })
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

  bulkDeleteUserRoles = async ({ userIds, role }: IBulkDeleteUserRoles) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const userId of userIds) {
        const deleteResult = await this.deleteUserRole({
          userId,
          role,
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
