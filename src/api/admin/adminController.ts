import { NextFunction, Request, Response } from 'express'
import { RoleType } from '../role/interface'
import { IUsersLimited, IUsersPaginationLimited } from './interface'
import { AdminService } from './adminService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class AdminController {
  private readonly userService: UserService
  private readonly adminService: AdminService

  constructor(userService: UserService, adminService: AdminService) {
    this.userService = userService
    this.adminService = adminService
  }

  addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phoneNumber } = res.locals.input
    const { id } = req.user

    const { code: adminCode } = await this.adminService.createAdmin({
      firstName,
      lastName,
      email,
      phoneNumber,
      assignedById: id
    })

    return next({ code: adminCode })
  }

  getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input

    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.ADMIN
    })

    if (userData) {
      const usersLimited: IUsersLimited[] = userData.users.map((user) => {
        return {
          userId: user.id,
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber
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

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.ADMIN
    })
    if (!user) {
      return next({ code })
    }

    let admin = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }

    return next({ data: { admin }, code })
  }

  editAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, firstName, lastName, phoneNumber } = res.locals.input

    const { code } = await this.adminService.editAdmin({
      userId,
      firstName,
      lastName,
      phoneNumber
    })

    return next({ code })
  }

  deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { code } = await this.adminService.deleteAdmin({
      userId
    })

    return next({ code })
  }

  bulkDeleteAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input

    const { code } = await this.adminService.bulkDeleteAdmins({
      userIds
    })

    return next({ code })
  }
}
