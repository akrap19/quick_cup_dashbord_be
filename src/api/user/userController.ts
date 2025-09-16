import { NextFunction, Request, Response } from 'express'
import { UserService } from '../user/userService'
import { ResponseCode } from '../../interface'
import { IUserSettings } from './interface'
import config from '../../config'
import { UserSessionStatus } from '../user_session/interface'
import { UserSessionService } from '../user_session/userSessionService'
import { autoInjectable } from 'tsyringe'
import { BarnahusService } from '../barnahus/barnahusService'

@autoInjectable()
export class UserController {
  private readonly userService: UserService
  private readonly userSessionService: UserSessionService
  private readonly barnahusService: BarnahusService

  constructor(
    userService: UserService,
    userSessionService: UserSessionService,
    barnahusService: BarnahusService
  ) {
    this.userService = userService
    this.userSessionService = userSessionService
    this.barnahusService = barnahusService
  }

  getUserSettings = async (req: Request, res: Response, next: NextFunction) => {
    let code: ResponseCode = ResponseCode.OK
    const { id: userId, barnahusId } = req.user

    const { user, code: userCode } = await this.userService.getUserById({
      userId
    })
    if (!user) {
      return next({ code: userCode })
    }

    const { barnahus } = await this.barnahusService.getBarnahusById({
      barnahusId: barnahusId
    })

    const settings: IUserSettings = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      newEmail: user.newEmail || null,
      phoneNumber: user.phoneNumber || null,
      locationCode: barnahus?.locationCode,
      barnahusName: barnahus?.name
    }

    return next({ data: settings, code })
  }

  editUserPersonalSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user
    const { firstName, lastName, phoneNumber } = res.locals.input

    const { code } = await this.userService.editUser({
      userId: id,
      firstName,
      lastName,
      phoneNumber
    })

    return next({ code })
  }

  editUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user
    const { newPassword, oldPassword } = res.locals.input

    const { code: passwordCode } = await this.userService.editUserPassword({
      userId: id,
      password: oldPassword,
      newPassword
    })

    await this.userSessionService.expireUserSession({
      userId: id,
      status: UserSessionStatus.EXPIRED
    })

    return next({ code: passwordCode })
  }

  editUserEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user
    const { email } = res.locals.input

    let { code } = await this.userService.changeUserEmail({
      userId: id,
      email
    })

    return next({ code })
  }

  validateUserEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { uid, hashUid } = res.locals.input

    const { userId, code } = await this.userService.verifyUserEmail({
      uid,
      hashUid
    })
    if (!userId) {
      return res.redirect(`${config.BASE_URL}/messages/error`)
    }

    await this.userSessionService.expireUserSession({
      userId,
      status: UserSessionStatus.EXPIRED
    })

    return res.redirect(`${config.BASE_URL}/messages/email-changed`)
  }
}
