import { NextFunction, Request, Response } from 'express'
import { RoleType } from '../role/interface'
import { IUsersLimited, IUsersPaginationLimited } from './interface'
import { AdminService } from './adminService'
import { UserRoleBarnahusService } from '../user_role_barnahus/userRoleBarnahusService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class AdminController {
  private readonly userRoleBarnahusService: UserRoleBarnahusService
  private readonly userService: UserService
  private readonly adminService: AdminService

  constructor(
    userRoleBarnahusService: UserRoleBarnahusService,
    userService: UserService,
    adminService: AdminService
  ) {
    this.userRoleBarnahusService = userRoleBarnahusService
    this.userService = userService
    this.adminService = adminService
  }

  addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phoneNumber } = res.locals.input
    const { id, barnahusId } = req.user

    const { code: adminCode } = await this.adminService.createAdmin({
      firstName,
      lastName,
      email,
      phoneNumber,
      assignedById: id,
      barnahusId
    })

    return next({ code: adminCode })
  }

  getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.ADMIN,
      barnahusId
    })

    if (userData) {
      const usersLimited: IUsersLimited[] = userData.users.map((user) => {
        let barnahusAdmin = user
          .userRoles!.find((userRole) => userRole.role.name == RoleType.ADMIN)!
          .userRoleBarnahuses!.find(
            (userRoleBarnahus) => userRoleBarnahus.barnahusId == barnahusId
          )
        const location = barnahusAdmin!.barnahus.location
        const locationCode = barnahusAdmin!.barnahus.locationCode

        return {
          userId: user.id,
          name: user.firstName + ' ' + user.lastName,
          location,
          locationCode
        }
      })

      let adminsData: IUsersPaginationLimited = {
        pagination: userData.pagination,
        users: usersLimited
      }

      return next({ data: adminsData, code })
    }

    return next({ code })
  }

  getAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input
    const { barnahusId } = req.user

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.ADMIN,
      barnahusId
    })
    if (!user) {
      return next({ code })
    }

    let barnahusAdmin = user
      .userRoles!.find((userRole) => userRole.role.name == RoleType.ADMIN)!
      .userRoleBarnahuses!.find(
        (userRoleBarnahus) => userRoleBarnahus.barnahusId == barnahusId
      )
    const location = barnahusAdmin!.barnahus.location
    const locationCode = barnahusAdmin!.barnahus.locationCode

    let admin = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location,
      locationCode
    }

    return next({ data: { admin }, code })
  }

  deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input
    const { barnahusId } = req.user

    const { code } = await this.userRoleBarnahusService.deleteUserRoleBarnahus({
      userId,
      role: RoleType.ADMIN,
      barnahusId
    })

    return next({ code })
  }

  bulkDeleteAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input
    const { barnahusId } = req.user

    const { code } =
      await this.userRoleBarnahusService.bulkDeleteUserRoleBarnahuses({
        role: RoleType.ADMIN,
        userIds,
        barnahusId
      })

    return next({ code })
  }

  editAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, firstName, lastName, phoneNumber } = res.locals.input
    const { barnahusId } = req.user

    const { code } = await this.adminService.editAdmin({
      barnahusId,
      userId,
      firstName,
      lastName,
      phoneNumber
    })

    return next({ code })
  }
}
