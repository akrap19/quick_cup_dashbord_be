import { NextFunction, Request, Response } from 'express'
import { RoleType } from '../role/interface'
import { IClientsLimited, IClientsPaginationLimited } from './interface'
import { ClientService } from './clientService'
import { UserService } from '../user/userService'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class ClientController {
  private readonly userService: UserService
  private readonly clientService: ClientService

  constructor(userService: UserService, clientService: ClientService) {
    this.userService = userService
    this.clientService = clientService
  }

  addClient = async (req: Request, res: Response, next: NextFunction) => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      location,
      productPrices,
      companyName,
      pin,
      street
    } = res.locals.input
    const { id } = req.user
    const { user, code } = await this.userService.getUserById({
      userId: id,
      allUsers: true
    })
    if (!user) {
      return next({ code })
    }

    const { code: clientCode } = await this.clientService.createClient({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      assignedById: id,
      productPrices,
      companyName,
      pin,
      street
    })

    return next({ code: clientCode })
  }

  getClients = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input
    const { userData, code } = await this.userService.getUsers({
      search,
      page,
      limit,
      role: RoleType.CLIENT
    })
    if (!userData) {
      return next({ code })
    }

    const usersLimited: IClientsLimited[] = userData.users.map((user) => {
      return {
        userId: user.id,
        name: user.firstName + ' ' + user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber ?? null,
        status: user.status,
        companyName: user.companyName || null
      }
    })

    let clientsData: IClientsPaginationLimited = {
      pagination: userData.pagination,
      users: usersLimited
    }

    return next({ data: clientsData, code })
  }

  getClient = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { user, code } = await this.userService.getUserById({
      userId,
      allUsers: true,
      role: RoleType.CLIENT
    })
    if (!user) {
      return next({ code })
    }

    const client = user.userRoles.find(
      (userRole) => userRole.role.name == RoleType.CLIENT
    )

    // Get client product prices
    const { data: productPrices } =
      await this.clientService.getAllClientProductPrices(userId)

    let clientData = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      location: user.location,
      status: user.status,
      assignedBy:
        client?.assignedBy?.firstName + ' ' + client?.assignedBy?.lastName,
      productPrices: productPrices || [],
      companyName: user.companyName || null,
      pin: user.pin || null,
      street: user.street || null
    }

    return next({ data: clientData, code })
  }

  deleteClient = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = res.locals.input

    const { code } = await this.clientService.deleteClient({
      userId
    })

    return next({ code })
  }

  bulkDeleteClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userIds } = res.locals.input

    const { code } = await this.clientService.bulkDeleteClients({
      userIds
    })

    return next({ code })
  }

  editClient = async (req: Request, res: Response, next: NextFunction) => {
    const {
      userId,
      firstName,
      lastName,
      phoneNumber,
      location,
      productPrices,
      companyName,
      pin,
      street
    } = res.locals.input

    const { code } = await this.clientService.editClient({
      userId,
      firstName,
      lastName,
      phoneNumber,
      location,
      productPrices,
      companyName,
      pin,
      street
    })

    return next({ code })
  }

  getAllClientProductPrices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { clientId } = res.locals.input

    const { data, code } = await this.clientService.getAllClientProductPrices(
      clientId
    )

    return next({ data, code })
  }
}
