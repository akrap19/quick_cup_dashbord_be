import { NextFunction, Request, Response } from 'express'
import { RoleType } from '../role/interface'
import {
  IPractitionersLimited,
  IPractitionersPaginationLimited
} from './interface'
import { PractitionerService } from './practitionerService'
import { UserRoleBarnahusService } from '../user_role_barnahus/userRoleBarnahusService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class PractitionerController {
  private readonly userRoleBarnahusService: UserRoleBarnahusService
  private readonly userService: UserService
  private readonly practitionerService: PractitionerService

  constructor(
    userRoleBarnahusService: UserRoleBarnahusService,
    userService: UserService,
    practitionerService: PractitionerService
  ) {
    this.userRoleBarnahusService = userRoleBarnahusService
    this.userService = userService
    this.practitionerService = practitionerService
  }

  addPractitioner = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phoneNumber, userProfession } =
      res.locals.input
    const { id, barnahusId } = req.user
    const { user, code } = await this.userService.getUserById({
      userId: id,
      allUsers: true,
      barnahusId
    })
    if (!user) {
      return next({ code })
    }

    const { code: practitionerCode } =
      await this.practitionerService.createPractitioner({
        firstName,
        lastName,
        email,
        phoneNumber,
        assignedById: id,
        barnahusId,
        userProfession
      })

    return next({ code: practitionerCode })
  }

  getPractitioners = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { search, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.PRACTITIONER,
      barnahusId
    })
    if (!userData) {
      return next({ code })
    }

    const usersLimited: IPractitionersLimited[] = userData.users.map((user) => {
      const practitionerUserRoleBarnahuses = user.userRoles
        .find((userRole) => userRole.role.name == RoleType.PRACTITIONER)
        ?.userRoleBarnahuses.find(
          (userRoleBarnahus) => userRoleBarnahus.barnahusId == barnahusId
        )

      const userProfession =
        practitionerUserRoleBarnahuses?.userProfession || 'Practitioner'

      const assignedBy =
        practitionerUserRoleBarnahuses?.assignedBy?.firstName +
        ' ' +
        practitionerUserRoleBarnahuses?.assignedBy?.lastName

      return {
        userId: user.id,
        name: user.firstName + ' ' + user.lastName,
        userProfession,
        assignedBy
      }
    })

    let practitionersData: IPractitionersPaginationLimited = {
      pagination: userData.pagination,
      users: usersLimited
    }

    return next({ data: practitionersData, code })
  }

  getPractitioner = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input
    const { barnahusId } = req.user

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.PRACTITIONER,
      barnahusId
    })
    if (!user) {
      return next({ code })
    }

    const practitioner = user.userRoles
      .find((userRole) => userRole.role.name == RoleType.PRACTITIONER)
      ?.userRoleBarnahuses.find(
        (userRoleBarnahus) => userRoleBarnahus.barnahusId == barnahusId
      )

    const userProfession = practitioner?.userProfession || 'Practitioner'
    const location = practitioner?.barnahus.location
    const locationCode = practitioner?.barnahus.locationCode

    let practitionerData = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userProfession,
      location,
      locationCode
    }

    return next({ data: practitionerData, code })
  }

  deletePractitioner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = res.locals.input
    const { barnahusId } = req.user

    // remove practitioner role
    const { code } = await this.userRoleBarnahusService.deleteUserRoleBarnahus({
      userId,
      role: RoleType.PRACTITIONER,
      barnahusId
    })

    return next({ code })
  }

  bulkDeletePractitioners = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input
    const { barnahusId } = req.user

    const { code } =
      await this.userRoleBarnahusService.bulkDeleteUserRoleBarnahuses({
        userIds,
        role: RoleType.PRACTITIONER,
        barnahusId
      })

    return next({ code })
  }

  editPractitioner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, firstName, lastName, phoneNumber, userProfession } =
      res.locals.input
    const { barnahusId } = req.user

    const { code } = await this.practitionerService.editPractitioner({
      userId,
      firstName,
      lastName,
      phoneNumber,
      userProfession,
      barnahusId
    })

    return next({ code })
  }
}
