import { ResponseCode } from '../../interface'
import { UserService } from '../user/userService'
import {
  IAuthService,
  ICheckCredentials,
  IGetUserRoleList,
  ILogout,
  IRefreshToken,
  IResetPassword,
  ISendForgotPasswordEmail,
  ISignToken,
  IUserRole,
  IUserRoleBarnahus,
  IVerifyUser,
  ICheckUserSpecificRole,
  IAuthenticateCasePassword,
  IChangeCasePassword,
  IGetApiKey
} from './interface'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { VerificationUIDType } from '../verification_uid/interface'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { compare, hashString } from '../../services/bcrypt'
import {
  KeyType,
  generateToken,
  verifyToken
} from '../../services/jsonwebtoken'
import config from '../../config'
import { UserSessionService } from '../user_session/userSessionService'
import { LoginType, UserSessionStatus } from '../user_session/interface'
import { UserRoleService } from '../user_role/userRoleService'
import { autoInjectable } from 'tsyringe'
import { EmailTemplateService } from '../email_template/emailTemplateService'
import { EmailTemplates } from '../email_template/interface'
import { CaseService } from '../case/caseService'
import { UserStatus } from '../user/interface'
import { Repository } from 'typeorm'
import { ApiKey } from './apiKeyModel'
import { AppDataSource } from '../../services/typeorm'

@autoInjectable()
export class AuthService implements IAuthService {
  private readonly apiKeyRepository: Repository<ApiKey>
  private readonly userService: UserService
  private readonly verificationUIDService: VerificationUIDService
  private readonly userSessionService: UserSessionService
  private readonly userRoleService: UserRoleService
  private readonly emailTemplateService: EmailTemplateService
  private readonly caseService: CaseService

  constructor(
    userService: UserService,
    verificationUIDService: VerificationUIDService,
    userSessionService: UserSessionService,
    userRoleService: UserRoleService,
    emailTemplateService: EmailTemplateService,
    caseService: CaseService
  ) {
    this.apiKeyRepository = AppDataSource.manager.getRepository(ApiKey)
    this.userService = userService
    this.verificationUIDService = verificationUIDService
    this.userSessionService = userSessionService
    this.userRoleService = userRoleService
    this.emailTemplateService = emailTemplateService
    this.caseService = caseService
  }

  verifyUser = async ({ uid, hashUid, password }: IVerifyUser) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { verificationUID, code: verificationUIDCode } =
        await this.verificationUIDService.verifyUID({
          uid,
          hashUid,
          type: VerificationUIDType.REGISTRATION
        })
      if (!verificationUID) {
        return { code: verificationUIDCode }
      }

      const hashedPassword = await hashString(password)

      const { user, code: userCode } = await this.userService.verifyUser({
        userId: verificationUID.userId,
        password: hashedPassword
      })
      if (!user) {
        return { code: userCode }
      }

      await this.verificationUIDService.clearVerificationUID({
        userId: user.id,
        type: VerificationUIDType.REGISTRATION
      })

      return { user, code: userCode }
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

  authenticatePassword = async ({ email, password }: ICheckCredentials) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { user, code: userCode } = await this.userService.getUserByEmail({
        email
      })
      if (!user) {
        return { code: userCode }
      }

      if (user.status == UserStatus.CREATED) {
        return { code: ResponseCode.USER_NOT_CONFIRMED }
      }

      const matches = await compare(password, user.password!)
      if (!matches) {
        return { code: ResponseCode.WRONG_PASSWORD }
      }

      return { user, code }
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

  authenticateCasePassword = async ({
    customId,
    password
  }: IAuthenticateCasePassword) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { case: userCase, code: caseCode } =
        await this.caseService.getCaseByCustomId({
          customId
        })

      if (!userCase) {
        return { code: caseCode }
      }

      const matches = await compare(password, userCase.password)
      if (!matches) {
        return { code: ResponseCode.WRONG_PASSWORD }
      }

      return { case: userCase, code }
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

  signToken = async ({
    sub,
    loginType,
    accessTokenExpiresIn,
    refreshTokenExpiresIn
  }: ISignToken) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const accessToken = generateToken(
        { sub, loginType },
        KeyType.ACCESS_TOKEN_PRIVATE_KEY,
        {
          expiresIn: `${
            accessTokenExpiresIn || config.ACCESS_TOKEN_EXPIRES_IN
          }m`
        }
      )

      const refreshToken = generateToken(
        { sub },
        KeyType.REFRESH_TOKEN_PRIVATE_KEY,
        {
          expiresIn: `${
            refreshTokenExpiresIn || config.REFRESH_TOKEN_EXPIRES_IN
          }m`
        }
      )

      let session
      if (loginType != LoginType.CASE) {
        const { userSession, code: userSessionCode } =
          await this.userSessionService.storeUserSession({
            loginType: loginType,
            userId: sub,
            refreshToken
          })
        if (!userSession) {
          return { code: userSessionCode }
        }
        session = userSession
      }

      const expiresAt = new Date(
        Date.now() + Number(config.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000
      )

      return {
        tokens: {
          accessToken,
          refreshToken,
          accessTokenExpiresAt: expiresAt,
          refreshTokenExpiresAt: session ? session.expiresAt : null
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

  refreshToken = async ({ refreshToken }: IRefreshToken) => {
    let code = ResponseCode.OK

    try {
      const decodedToken = verifyToken<{
        sub: string
        exp: number
        loginType: LoginType
      }>(refreshToken, KeyType.REFRESH_TOKEN_PRIVATE_KEY)
      if (!decodedToken) {
        return { code: ResponseCode.SESSION_EXPIRED }
      }

      let refreshTokenExpiry = new Date(decodedToken.exp * 1000)
      if (refreshTokenExpiry < new Date()) {
        return { code: ResponseCode.SESSION_EXPIRED }
      }

      const newRefreshToken = generateToken(
        { sub: decodedToken.sub },
        KeyType.REFRESH_TOKEN_PRIVATE_KEY,
        {
          expiresIn: `${config.REFRESH_TOKEN_EXPIRES_IN}m`
        }
      )

      const { userSession, code: updateUserSessionCode } =
        await this.userSessionService.updateUserSession({
          userId: decodedToken.sub,
          refreshToken: newRefreshToken
        })
      if (!userSession) {
        return { code: updateUserSessionCode }
      }

      const accessToken = generateToken(
        { sub: decodedToken.sub, loginType: userSession.loginType },
        KeyType.ACCESS_TOKEN_PRIVATE_KEY,
        {
          expiresIn: `${config.ACCESS_TOKEN_EXPIRES_IN}m`
        }
      )

      const expiresAt = new Date(
        Date.now() + Number(config.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000
      )

      const { user, code: userCode } = await this.userService.getUserById({
        userId: decodedToken.sub
      })
      if (!user) {
        return { code: userCode }
      }

      return {
        data: {
          user,
          tokens: {
            accessToken,
            refreshToken,
            accessTokenExpiresAt: expiresAt,
            refreshTokenExpiresAt: userSession.expiresAt
          }
        },
        code
      }
    } catch (err: any) {
      code = ResponseCode.INVALID_TOKEN
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  logout = async ({ userId }: ILogout) => {
    let code = ResponseCode.OK

    try {
      const { code: userSessionCode } =
        await this.userSessionService.expireUserSession({
          userId,
          status: UserSessionStatus.LOGGED_OUT
        })

      return { code: userSessionCode }
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

  getUserRoleList = async ({ userId }: IGetUserRoleList) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRoles, code: userRoleCode } =
        await this.userRoleService.getUserRoles({
          userId
        })
      if (!userRoles) {
        return { code: userRoleCode }
      }

      let roles: IUserRole[] = []
      let barnahusRoles: IUserRoleBarnahus[] = []
      for (let userRole of userRoles) {
        let barnahuses = []

        let role = {
          userRoleId: userRole.id,
          name: userRole.role.name
        }

        if (
          userRole.userRoleBarnahuses &&
          userRole.userRoleBarnahuses.length > 0
        ) {
          for (let userRoleBarnahus of userRole.userRoleBarnahuses) {
            barnahuses.push({
              barnahusId: userRoleBarnahus.barnahus.id,
              name: userRoleBarnahus.barnahus.name,
              location: userRoleBarnahus.barnahus.location
            })

            let existingBarnahusIndex = barnahusRoles.findIndex(
              (barnahusRole) =>
                barnahusRole.barnahusId == userRoleBarnahus.barnahusId
            )
            if (existingBarnahusIndex > -1) {
              barnahusRoles[existingBarnahusIndex].userRoles = [
                ...barnahusRoles[existingBarnahusIndex].userRoles,
                role
              ]
            } else {
              barnahusRoles.push({
                barnahusId: userRoleBarnahus.barnahus.id,
                name: userRoleBarnahus.barnahus.name,
                location: userRoleBarnahus.barnahus.location,
                userRoles: [role]
              })
            }
          }
        }

        roles.push({
          ...role,
          barnahuses
        })
      }

      return { userRoleData: { userRoles: roles, barnahusRoles }, code }
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

  checkIfSpecificRole = async ({ userId, roles }: ICheckUserSpecificRole) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { userRoles, code: userRoleCode } =
        await this.userRoleService.getUserSpecificRoles({
          userId,
          roles
        })

      if (!userRoles) {
        return { code: userRoleCode }
      }

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

  sendForgotPasswordEmail = async ({ email }: ISendForgotPasswordEmail) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { user, code: userCode } = await this.userService.getUserByEmail({
        email
      })
      if (!user) {
        return { code: userCode }
      }

      if (user.status != UserStatus.ACTIVE) {
        return { code: ResponseCode.OK }
      }

      const { uids, code: uidCode } =
        await this.verificationUIDService.setVerificationUID({
          userId: user.id,
          type: VerificationUIDType.RESET_PASSWORD
        })
      if (!uids) {
        return { code: uidCode }
      }

      await this.emailTemplateService.sendEmail({
        to: user.email,
        template: EmailTemplates.FORGOT_PASSWORD,
        data: {
          URL: `${config.BASE_URL}/reset-password?uid=${uids.uid}/${uids.hashUID}`
        }
      })

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

  resetPassword = async ({ uid, hashUid, password }: IResetPassword) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { verificationUID, code: verificationUIDCode } =
        await this.verificationUIDService.verifyUID({
          uid,
          hashUid,
          type: VerificationUIDType.RESET_PASSWORD
        })
      if (!verificationUID) {
        return { code: verificationUIDCode }
      }

      const hashedPassword = await hashString(password)

      const { code: editCode } = await this.userService.editUser({
        userId: verificationUID.userId,
        password: hashedPassword
      })
      if (editCode != ResponseCode.OK) {
        return { code: editCode }
      }

      await this.verificationUIDService.clearVerificationUID({
        userId: verificationUID.userId,
        type: VerificationUIDType.RESET_PASSWORD
      })

      return { userId: verificationUID.userId, code: ResponseCode.OK }
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

  async getApiKey({ key }: IGetApiKey) {
    let code = ResponseCode.OK

    try {
      const apiKey = await this.apiKeyRepository.findOne({
        where: { key }
      })

      if (!apiKey) {
        return { code: ResponseCode.INVALID_API_KEY }
      }

      return { apiKey, code }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
