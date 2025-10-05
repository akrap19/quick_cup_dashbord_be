import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { RoleName, RoleType } from '../role/interface'
import { UserService } from '../user/userService'
import { UserRoleService } from '../user_role/userRoleService'
import {
  IMasterAdminService,
  ICreateMasterAdmin,
  IEditMasterAdmin
} from './interface'
import { User } from '../user/userModel'
import { autoInjectable } from 'tsyringe'
import { UserStatus } from '../user/interface'
import { VerificationUIDType } from '../verification_uid/interface'
import { EmailTemplates } from '../../services/email/templates'
import config from '../../config'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'

@autoInjectable()
export class MasterAdminService implements IMasterAdminService {
  private readonly userService: UserService
  private readonly userRoleService: UserRoleService
  private readonly verificationUIDService: VerificationUIDService

  constructor(
    userService: UserService,
    userRoleService: UserRoleService,
    verificationUIDService: VerificationUIDService
  ) {
    this.userService = userService
    this.userRoleService = userRoleService
    this.verificationUIDService = verificationUIDService
  }

  createMasterAdmin = async ({
    firstName,
    lastName,
    email,
    phoneNumber,
    assignedById
  }: ICreateMasterAdmin) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()
    let user: User

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { user: existingUser } = await this.userService.getUserByEmail({
        email
      })

      if (!existingUser) {
        const { user: newUser, code: newUserCode } =
          await this.userService.createUser({
            firstName,
            lastName,
            email,
            phoneNumber,
            queryRunner
          })
        if (!newUser) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: newUserCode }
        }
        user = newUser
      } else {
        user = existingUser
      }

      const { code: assignRoleCode } = await this.userRoleService.assignRole({
        userId: user.id,
        roleName: RoleType.MASTER_ADMIN,
        assignedById,
        queryRunner
      })

      if (
        assignRoleCode != ResponseCode.OK &&
        assignRoleCode != ResponseCode.CONFLICT_USER_ROLE
      ) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: assignRoleCode }
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

  editMasterAdmin = async ({
    userId,
    firstName,
    lastName,
    phoneNumber
  }: IEditMasterAdmin) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRole, code: roleCode } =
        await this.userRoleService.getUserRole({
          userId,
          role: RoleType.MASTER_ADMIN
        })
      if (!userRole) {
        return { code: roleCode }
      }

      const { code: editCode } = await this.userService.editUser({
        userId,
        firstName,
        lastName,
        phoneNumber
      })

      return { code: editCode }
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
