import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'

import { ResponseCode } from '../../interface'
import { OrdersService } from './ordersService'
import { RoleType } from '../role/interface'

@autoInjectable()
export class OrdersController {
  private readonly ordersService: OrdersService

  constructor(ordersService: OrdersService) {
    this.ordersService = ordersService
  }

  listOrders = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { page, limit, search, status } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null
    const statusFilter = typeof status === 'string' ? status : null

    // If user is a CLIENT, filter orders by their customerId
    const isClient = req.user?.roles?.some(
      (userRole) => userRole.role.name === RoleType.CLIENT
    )
    const customerId = isClient ? req.user?.id : null

    const { orders, pagination, code } = await this.ordersService.listOrders({
      page: pageNumber,
      limit: limitNumber,
      search: searchTerm,
      status: statusFilter,
      customerId
    })

    if (!orders || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        orders,
        pagination
      },
      code
    })
  }

  getOrder = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { orderId } = input

    // If user is a CLIENT, filter orders by their customerId
    const isClient = req.user?.roles?.some(
      (userRole) => userRole.role.name === RoleType.CLIENT
    )
    const customerId = isClient ? req.user?.id : null

    const { order, code } = await this.ordersService.getOrderById({
      orderId,
      customerId
    })

    if (!order) {
      return next({ code })
    }

    return next({ data: order, code })
  }

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      totalAmount,
      notes,
      acquisitionType,
      customerId,
      eventId,
      location,
      place,
      street,
      contactPerson,
      contactPersonContact,
      products,
      services,
      additionalCosts
    } = input

    const numericAmount =
      typeof totalAmount === 'number'
        ? totalAmount
        : totalAmount
        ? Number(totalAmount)
        : undefined

    if (typeof numericAmount !== 'number' || Number.isNaN(numericAmount)) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { order, code } = await this.ordersService.createOrder({
      totalAmount: numericAmount,
      notes,
      acquisitionType,
      customerId,
      eventId,
      location,
      place,
      street,
      contactPerson,
      contactPersonContact,
      products,
      services,
      additionalCosts
    })

    if (!order) {
      return next({ code })
    }

    return next({ data: order, code })
  }

  updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      orderId,
      status,
      totalAmount,
      notes,
      acquisitionType,
      customerId,
      eventId,
      location,
      place,
      street,
      contactPerson,
      contactPersonContact,
      products,
      services,
      additionalCosts
    } = input

    const numericAmount =
      typeof totalAmount === 'number'
        ? totalAmount
        : totalAmount
        ? Number(totalAmount)
        : undefined

    if (
      typeof orderId !== 'string' ||
      (typeof status === 'undefined' &&
        typeof numericAmount === 'undefined' &&
        typeof notes === 'undefined' &&
        typeof acquisitionType === 'undefined' &&
        typeof customerId === 'undefined' &&
        typeof eventId === 'undefined' &&
        typeof location === 'undefined' &&
        typeof place === 'undefined' &&
        typeof street === 'undefined' &&
        typeof contactPerson === 'undefined' &&
        typeof contactPersonContact === 'undefined' &&
        typeof products === 'undefined' &&
        typeof services === 'undefined' &&
        typeof additionalCosts === 'undefined')
    ) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { order, code } = await this.ordersService.updateOrder({
      orderId,
      status,
      totalAmount: numericAmount,
      notes,
      acquisitionType,
      customerId,
      eventId,
      location,
      place,
      street,
      contactPerson,
      contactPersonContact,
      products,
      services,
      additionalCosts
    })

    if (!order) {
      return next({ code })
    }

    return next({ data: order, code })
  }

  deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { orderId } = input

    const { code } = await this.ordersService.deleteOrder({
      orderId
    })

    return next({ code })
  }

  updateOrderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { orderId, status } = input

    if (typeof orderId !== 'string' || typeof status !== 'string') {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { order, code } = await this.ordersService.updateOrderStatus({
      orderId,
      status
    })

    if (!order) {
      return next({ code })
    }

    return next({ data: order, code })
  }
}
