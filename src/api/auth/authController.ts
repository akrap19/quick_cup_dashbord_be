import { NextFunction, Request, Response } from 'express'
import { ResponseCode } from '../../interface'
import { AuthService } from './authService'
import _ from 'lodash'
import { UserService } from '../user/userService'
import { VerificationUIDService } from '../verification_uid/verificationUIDService'
import { autoInjectable } from 'tsyringe'
import { RoleType } from '../role/interface'
import { LoginType } from '../user_session/interface'
import { BarnahusService } from '../barnahus/barnahusService'

@autoInjectable()
export class AuthController {
  private readonly authService: AuthService
  private readonly userService: UserService
  private readonly verificationUIDService: VerificationUIDService
  private readonly barnahusService: BarnahusService

  constructor(
    authService: AuthService,
    userService: UserService,
    verificationUIDService: VerificationUIDService,
    barnahusService: BarnahusService
  ) {
    this.authService = authService
    this.userService = userService
    this.verificationUIDService = verificationUIDService
    this.barnahusService = barnahusService
  }

  verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    const { uid, password } = res.locals.input

    let uids = uid.split('/')
    if (uids.length > 2) {
      return next({ code: ResponseCode.INVALID_UID })
    }

    const { user, code } = await this.authService.verifyUser({
      uid: uids[0],
      hashUid: uids[1],
      password
    })
    if (!user) {
      return next({ code })
    }

    const { userRoleData, code: userRoleCode } =
      await this.authService.getUserRoleList({ userId: user.id })
    if (!userRoleData) {
      return next({ code: userRoleCode })
    }

    let responseUser: any = _.omit(user, [
      'id',
      'status',
      'password',
      'createdAt',
      'updatedAt'
    ])

    responseUser.userId = user.id

    const { tokens, code: tokenCode } = await this.authService.signToken({
      sub: user.id,
      loginType: LoginType.WEB
    })
    if (!tokens) {
      return next({ code: tokenCode })
    }

    return next({
      data: {
        user: {
          ...responseUser,
          roles: userRoleData.userRoles,
          barnahusRoles: userRoleData.barnahusRoles
        },
        ...tokens
      },
      code: ResponseCode.OK
    })
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = res.locals.input

    const { user, code } = await this.authService.authenticatePassword({
      email,
      password
    })
    if (!user) {
      return next({ code })
    }

    const { userRoleData, code: userRoleCode } =
      await this.authService.getUserRoleList({ userId: user.id })
    if (!userRoleData) {
      return next({ code: userRoleCode })
    }

    let responseUser: any = _.omit(user, [
      'id',
      'status',
      'password',
      'createdAt',
      'updatedAt'
    ])

    responseUser.userId = user.id

    const { tokens, code: tokenCode } = await this.authService.signToken({
      sub: user.id,
      loginType: LoginType.WEB
    })
    if (!tokens) {
      return next({ code: tokenCode })
    }

    return next({
      data: {
        user: {
          ...responseUser,
          roles: userRoleData.userRoles,
          barnahusRoles: userRoleData.barnahusRoles
        },
        ...tokens
      },
      code: ResponseCode.OK
    })
  }

  mobileLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, locationCode } = res.locals.input

    const { user, code } = await this.authService.authenticatePassword({
      email,
      password
    })
    if (!user) {
      return next({ code })
    }

    const { userRoles, code: userRoleCode } =
      await this.authService.checkIfSpecificRole({
        userId: user.id,
        roles: [RoleType.PRACTITIONER]
      })

    if (!userRoles) {
      return next({ code: userRoleCode })
    }

    let barnahusId = undefined
    if (locationCode) {
      const { barnahus, code: barnahusCode } =
        await this.barnahusService.getBarnahusByLocationCode({
          locationCode
        })

      if (!barnahus) {
        return next({ code: barnahusCode })
      }

      barnahusId = barnahus.id
    }

    const { tokens, code: tokenCode } = await this.authService.signToken({
      sub: user.id,
      loginType: LoginType.MOBILE
    })

    if (!tokens) {
      return next({ code: tokenCode })
    }

    return next({
      data: {
        ...tokens,
        ...(locationCode && { barnahusId })
      },
      code: ResponseCode.OK
    })
  }

  caseLogin = async (req: Request, res: Response, next: NextFunction) => {
    const { customId, password } = res.locals.input

    const { case: userCase, code } =
      await this.authService.authenticateCasePassword({
        customId,
        password
      })
    if (!userCase) {
      return next({ code })
    }

    const { tokens, code: tokenCode } = await this.authService.signToken({
      sub: userCase.id,
      loginType: LoginType.CASE,
      accessTokenExpiresIn: 60 * 24 * 7
    })

    if (!tokens) {
      return next({ code: tokenCode })
    }

    return next({
      data: {
        ...tokens,
        shouldChangePassword: userCase.shouldChangePassword,
        canAddNotes: userCase.canAddNotes
      },
      code: ResponseCode.OK
    })
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers['refresh-token'] as string

    const { data, code } = await this.authService.refreshToken({
      refreshToken
    })
    if (!data) {
      return next({ code })
    }

    const { userRoleData, code: userRoleCode } =
      await this.authService.getUserRoleList({ userId: data.user.id })
    if (!userRoleData) {
      return next({ code: userRoleCode })
    }

    let responseUser: any = _.omit(data.user, [
      'id',
      'status',
      'password',
      'createdAt',
      'updatedAt'
    ])

    responseUser.userId = data.user.id

    return next({
      data: {
        user: {
          ...responseUser,
          roles: userRoleData.userRoles,
          barnahusRoles: userRoleData.barnahusRoles
        },
        ...data.tokens
      },
      code: ResponseCode.OK
    })
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = req

    const { code } = await this.authService.logout({ userId: user.id })

    return next({ code })
  }

  getEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { uid } = res.locals.input

    const verificationResult =
      await this.verificationUIDService.getVerificationUID({
        uid
      })
    if (!verificationResult.verificationUID) {
      return next({ code: verificationResult.code })
    }

    let { user, code } = await this.userService.getUserById({
      userId: verificationResult.verificationUID.userId,
      allUsers: true
    })
    if (!user) {
      return next({ code })
    }

    return next({ data: user.email, code })
  }

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = res.locals.input

    const { code } = await this.authService.sendForgotPasswordEmail({ email })

    return next({ code })
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { uid, password } = res.locals.input

    let uids = uid.split('/')
    if (uids.length > 2) {
      return next({ code: ResponseCode.INVALID_UID })
    }

    const { userId, code: resetPasswordCode } =
      await this.authService.resetPassword({
        uid: uids[0],
        hashUid: uids[1],
        password
      })
    if (!userId) {
      return next({ code: resetPasswordCode })
    }

    const { user, code: userCode } = await this.userService.getUserById({
      userId
    })
    if (!user) {
      return next({ code: userCode })
    }

    const { userRoleData, code: userRoleCode } =
      await this.authService.getUserRoleList({ userId: user.id })
    if (!userRoleData) {
      return next({ code: userRoleCode })
    }

    let responseUser: any = _.omit(user, [
      'id',
      'status',
      'password',
      'createdAt',
      'updatedAt'
    ])

    responseUser.userId = user.id

    const { tokens, code: tokenCode } = await this.authService.signToken({
      sub: user.id,
      loginType: LoginType.WEB
    })
    if (!tokens) {
      return next({ code: tokenCode })
    }

    return next({
      data: {
        user: {
          ...responseUser,
          roles: userRoleData.userRoles,
          barnahusRoles: userRoleData.barnahusRoles
        },
        ...tokens
      },
      code: ResponseCode.OK
    })
  }
}
