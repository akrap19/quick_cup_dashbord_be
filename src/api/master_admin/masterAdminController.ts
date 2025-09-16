import { NextFunction, Request, Response } from 'express'
import { UserRoleService } from '../user_role/userRoleService'
import { RoleType } from '../role/interface'
import { IUsersLimited, IUsersPaginationLimited } from '../admin/interface'
import {
  IMasterAdminsLimited,
  IMasterAdminsPaginationLimited
} from './interface'
import { MasterAdminService } from './masterAdminService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class MasterAdminController {
  private readonly userRoleService: UserRoleService
  private readonly userService: UserService
  private readonly masterAdminService: MasterAdminService

  constructor(
    userRoleService: UserRoleService,
    masterAdminService: MasterAdminService,
    userService: UserService
  ) {
    this.userRoleService = userRoleService
    this.masterAdminService = masterAdminService
    this.userService = userService
  }

  addMasterAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phoneNumber, barnahusId } =
      res.locals.input
    const { id: authenticatedUserId } = req.user

    const { code } = await this.masterAdminService.createMasterAdmin({
      firstName,
      lastName,
      email,
      phoneNumber,
      assignedById: authenticatedUserId,
      barnahusId
    })

    return next({ code })
  }

  getMasterAdmins = async (req: Request, res: Response, next: NextFunction) => {
    const { search, location, page, limit } = res.locals.input

    const { userData, code } = await this.userService.getUsers({
      location,
      search,
      page,
      limit,
      role: RoleType.MASTER_ADMIN
    })

    if (!userData) {
      return next({ code })
    }

    const usersLimited: IMasterAdminsLimited[] = userData.users.map((user) => {
      let locations: string[] = []

      for (let userRole of user.userRoles) {
        if (userRole.role.name == RoleType.MASTER_ADMIN) {
          for (let userRoleBarnahus of userRole.userRoleBarnahuses) {
            locations.push(
              `${userRoleBarnahus.barnahus.name} (${userRoleBarnahus.barnahus.locationCode})`
            )
          }
        }
      }

      return {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        locations,
        deletable: locations.length == 0
      }
    })

    let adminsData: IMasterAdminsPaginationLimited = {
      pagination: userData.pagination,
      users: usersLimited
    }

    return next({ data: adminsData, code })
  }

  getMasterAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.MASTER_ADMIN
    })
    if (!user) {
      return next({ code })
    }

    let locations: string[] = []

    for (let userRole of user.userRoles) {
      if (userRole.role.name == RoleType.MASTER_ADMIN) {
        for (let userRoleBarnahus of userRole.userRoleBarnahuses) {
          locations.push(
            `${userRoleBarnahus.barnahus.name} (${userRoleBarnahus.barnahus.locationCode})`
          )
        }
      }
    }

    let masterAdmin = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      locations
    }

    return next({ data: { masterAdmin }, code })
  }

  deleteMasterAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId } = res.locals.input

    const { code } = await this.userRoleService.deleteUserRole({
      userId,
      role: RoleType.MASTER_ADMIN
    })

    return next({ code })
  }

  bulkDeleteMasterAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input

    const { code } = await this.userRoleService.bulkDeleteUserRoles({
      userIds,
      role: RoleType.MASTER_ADMIN
    })

    return next({ code })
  }

  editMasterAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, firstName, lastName, phoneNumber } = res.locals.input

    const { code } = await this.masterAdminService.editMasterAdmin({
      userId,
      firstName,
      lastName,
      phoneNumber
    })

    return next({ code })
  }

  getAssignableMasterAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { search, page, limit } = res.locals.input

    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.MASTER_ADMIN
    })

    if (!userData) {
      return next({ code })
    }

    const usersLimited: IUsersLimited[] = userData.users.map((masterAdmin) => {
      return {
        userId: masterAdmin.id,
        name: `${masterAdmin.firstName} ${masterAdmin.lastName}`,
        location: null
      }
    })

    let adminsData: IUsersPaginationLimited = {
      pagination: userData.pagination,
      users: usersLimited
    }

    return next({ data: adminsData, code })
  }
}
