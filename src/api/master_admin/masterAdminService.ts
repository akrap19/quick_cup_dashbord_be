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
import { UserRoleBarnahusService } from '../user_role_barnahus/userRoleBarnahusService'
import { UserStatus } from '../user/interface'
import { VerificationUIDType } from '../verification_uid/interface'
import { EmailTemplates } from '../email_template/interface'
import config from '../../config'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { EmailTemplateService } from '../email_template/emailTemplateService'

@autoInjectable()
export class MasterAdminService implements IMasterAdminService {
  private readonly userService: UserService
  private readonly userRoleService: UserRoleService
  private readonly userRoleBarnahusService: UserRoleBarnahusService
  private readonly verificationUIDService: VerificationUIDService
  private readonly emailTemplateService: EmailTemplateService

  constructor(
    userService: UserService,
    userRoleService: UserRoleService,
    userRoleBarnahusService: UserRoleBarnahusService,
    verificationUIDService: VerificationUIDService,
    emailTemplateService: EmailTemplateService
  ) {
    this.userService = userService
    this.userRoleService = userRoleService
    this.userRoleBarnahusService = userRoleBarnahusService
    ;(this.verificationUIDService = verificationUIDService),
      (this.emailTemplateService = emailTemplateService)
  }

  createMasterAdmin = async ({
    firstName,
    lastName,
    email,
    phoneNumber,
    assignedById,
    barnahusId
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

      if (barnahusId) {
        const { userRoleBarnahus: existingMasterAdmin } =
          await this.userRoleBarnahusService.getUserRoleBarnahus({
            userId: user.id,
            role: RoleType.MASTER_ADMIN,
            barnahusId
          })
        if (existingMasterAdmin) {
          return { code: ResponseCode.BARNAHUS_HAS_MASTER_ADMIN }
        }

        const { userRole, code: userRoleBarnahusCode } =
          await this.userRoleBarnahusService.assignUserRoleToBarnahus({
            userId: user.id,
            role: RoleType.MASTER_ADMIN,
            barnahusId,
            assignedById,
            queryRunner
          })

        if (!userRole) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: userRoleBarnahusCode }
        }

        //Send delayed verification email if user has not yet been verified
        if (userRole.user.status == UserStatus.CREATED) {
          const { uids, code: uidCode } =
            await this.verificationUIDService.setVerificationUID({
              userId: userRole.userId,
              type: VerificationUIDType.REGISTRATION,
              queryRunner
            })
          if (!uids) {
            return { code: uidCode }
          }

          await this.emailTemplateService.sendEmail({
            to: userRole.user.email,
            template: EmailTemplates.INVITATION,
            data: {
              URL: `${config.BASE_URL}/register?uid=${uids.uid}/${uids.hashUID}`,
              ROLE: RoleName.MASTER_ADMIN
            }
          })
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
