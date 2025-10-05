import { NextFunction, Request, Response } from 'express'
import { RoleType } from '../role/interface'
import { IServicesLimited, IServicesPaginationLimited } from './interface'
import { ServiceService } from './serviceService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class ServiceController {
  private readonly userService: UserService
  private readonly serviceService: ServiceService

  constructor(userService: UserService, serviceService: ServiceService) {
    this.userService = userService
    this.serviceService = serviceService
  }

  addService = async (req: Request, res: Response, next: NextFunction) => {
    const { email, firstName, lastName, phoneNumber } = res.locals.input
    const { id } = req.user

    const { code: serviceCode } = await this.serviceService.createService({
      firstName,
      lastName,
      email,
      phoneNumber,
      assignedById: id
    })

    return next({ code: serviceCode })
  }

  getServices = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input

    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.SERVICE
    })

    if (userData) {
      const usersLimited: IServicesLimited[] = userData.users.map((user) => {
        return {
          userId: user.id,
          name: user.firstName + ' ' + user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      })

      let servicesData: IServicesPaginationLimited = {
        pagination: userData.pagination,
        users: usersLimited
      }

      return next({ data: servicesData, code })
    }

    return next({ code })
  }

  getService = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.SERVICE
    })
    if (!user) {
      return next({ code })
    }

    let service = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    }

    return next({ data: { service }, code })
  }

  editService = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, firstName, lastName, phoneNumber } = res.locals.input

    const { code } = await this.serviceService.editService({
      userId,
      firstName,
      lastName,
      phoneNumber
    })

    return next({ code })
  }

  deleteService = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { code } = await this.serviceService.deleteService({
      userId
    })

    return next({ code })
  }

  bulkDeleteServices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input

    const { code } = await this.serviceService.bulkDeleteServices({
      userIds
    })

    return next({ code })
  }
}
