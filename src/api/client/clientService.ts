import { ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { RoleName, RoleType } from '../role/interface'
import { UserService } from '../user/userService'
import { UserRoleService } from '../user_role/userRoleService'
import { IClientService, ICreateClient, IEditUser } from './interface'
import { User } from '../user/userModel'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { VerificationUIDType } from '../verification_uid/interface'
import config from '../../config'
import { EmailTemplates } from '../../services/email/templates'
import { autoInjectable } from 'tsyringe'
import { emailService } from '../../services/email'

@autoInjectable()
export class ClientService implements IClientService {
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

  createClient = async ({
    firstName,
    lastName,
    email,
    phoneNumber,
    assignedById
  }: ICreateClient) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()
    let user: User

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { user: existingUser } = await this.userService.getUserByEmail({
        email
      })

      let sendEmail = false
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

        const { uids, code: uidCode } =
          await this.verificationUIDService.setVerificationUID({
            userId: newUser.id,
            type: VerificationUIDType.REGISTRATION,
            queryRunner
          })
        if (!uids) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: uidCode }
        }

        await emailService.sendEmail({
          to: email,
          template: EmailTemplates.INVITATION,
          data: {
            URL: `${config.CLIENT_BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
            ROLE: RoleName.CLIENT
          }
        })

        user = newUser
      } else {
        const { code: editCode } = await this.userService.editUser({
          userId: existingUser.id,
          firstName,
          lastName,
          phoneNumber
        })

        if (editCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: editCode }
        }

        user = existingUser
        sendEmail = true
      }

      const { code: assignRoleCode } = await this.userRoleService.assignRole({
        userId: user.id,
        roleName: RoleType.CLIENT,
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

  editClient = async ({
    userId,
    firstName,
    lastName,
    phoneNumber
  }: IEditUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { code: editUserCode } = await this.userService.editUser({
        userId,
        firstName,
        lastName,
        phoneNumber
      })

      if (editUserCode != ResponseCode.OK) {
        return { code: editUserCode }
      }

      return { code: editUserCode }
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

  deleteClient = async ({ userId }: { userId: string }) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { code: deleteCode } = await this.userService.anonymizeUser({
        userId
      })

      return { code: deleteCode }
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

  bulkDeleteClients = async ({ userIds }: { userIds: string[] }) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      for (const userId of userIds) {
        const { code: deleteCode } = await this.userService.anonymizeUser({
          userId
        })

        if (deleteCode !== ResponseCode.OK) {
          return { code: deleteCode }
        }
      }

      return { code: ResponseCode.OK }
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
