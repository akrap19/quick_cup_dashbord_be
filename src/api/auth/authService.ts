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
  IStoreUserSession,
  IUserRole,
  IVerifyUser,
  ICheckUserSpecificRole,
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
import { EmailTemplates } from '../../services/email/templates'
import { UserStatus } from '../user/interface'
import { emailService } from '../../services/email'
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

  constructor(
    userService: UserService,
    verificationUIDService: VerificationUIDService,
    userSessionService: UserSessionService,
    userRoleService: UserRoleService
  ) {
    this.apiKeyRepository = AppDataSource.manager.getRepository(ApiKey)
    this.userService = userService
    this.verificationUIDService = verificationUIDService
    this.userSessionService = userSessionService
    this.userRoleService = userRoleService
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

      const expiresAt = new Date(
        Date.now() + Number(config.ACCESS_TOKEN_EXPIRES_IN) * 60 * 1000
      )

      const refreshTokenExpiresAt = new Date(
        Date.now() + Number(config.REFRESH_TOKEN_EXPIRES_IN) * 60 * 1000
      )

      return {
        tokens: {
          accessToken,
          refreshToken,
          accessTokenExpiresAt: expiresAt,
          refreshTokenExpiresAt: refreshTokenExpiresAt
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

  storeUserSession = async ({
    userId,
    refreshToken,
    loginType
  }: IStoreUserSession) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { code: userSessionCode } =
        await this.userSessionService.storeUserSession({
          userId,
          refreshToken,
          loginType
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
      for (let userRole of userRoles) {
        let role = {
          userRoleId: userRole.id,
          name: userRole.role.name
        }

        roles.push(role)
      }

      return { userRoleData: { userRoles: roles }, code }
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

      await emailService.sendEmail({
        to: user.email,
        template: EmailTemplates.FORGOT_PASSWORD,
        data: {
          URL: `${config.CLIENT_BASE_URL}/reset-password?uid=${uids.uid}/${uids.hashUID}`
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
