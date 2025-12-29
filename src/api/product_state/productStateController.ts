import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { ResponseCode } from '../../interface'
import { ProductStateService } from './productStateService'
import {
  ProductStateStatus,
  ProductStateLocation
} from './interface'

@autoInjectable()
export class ProductStateController {
  private readonly productStateService: ProductStateService

  constructor(productStateService: ProductStateService) {
    this.productStateService = productStateService
  }

  listProductStates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const {
      page,
      limit,
      search,
      status,
      location,
      productId,
      serviceId,
      userId
    } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null
    const statusFilter =
      typeof status === 'string' &&
      Object.values(ProductStateStatus).includes(status as ProductStateStatus)
        ? (status as ProductStateStatus)
        : null
    const locationFilter =
      typeof location === 'string' &&
      Object.values(ProductStateLocation).includes(
        location as ProductStateLocation
      )
        ? (location as ProductStateLocation)
        : null
    const productIdFilter =
      typeof productId === 'string' ? productId : null
    const serviceIdFilter =
      typeof serviceId === 'string' ? serviceId : null
    const userIdFilter =
      typeof userId === 'string' ? userId : null

    const { productStates, pagination, code } =
      await this.productStateService.listProductStates({
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm,
        status: statusFilter,
        location: locationFilter,
        productId: productIdFilter,
        serviceId: serviceIdFilter,
        userId: userIdFilter
      })

    if (!productStates || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        productStates,
        pagination
      },
      code
    })
  }

  getProductState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { productStateId } = input

    const { productState, code } =
      await this.productStateService.getProductStateById({
        productStateId
      })

    if (!productState) {
      return next({ code })
    }

    return next({ data: productState, code })
  }

  createProductState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { status, location, quantity, productId, serviceId, userId } = input

    if (
      typeof status !== 'string' ||
      !Object.values(ProductStateStatus).includes(status as ProductStateStatus)
    ) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    if (
      typeof location !== 'string' ||
      !Object.values(ProductStateLocation).includes(
        location as ProductStateLocation
      )
    ) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    if (typeof productId !== 'string') {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { productState, code } =
      await this.productStateService.createProductState({
        status: status as ProductStateStatus,
        location: location as ProductStateLocation,
        quantity,
        productId,
        serviceId: typeof serviceId === 'string' ? serviceId : null,
        userId: typeof userId === 'string' ? userId : null
      })

    if (!productState) {
      return next({ code })
    }

    return next({ data: productState, code })
  }

  updateProductState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const {
      productStateId,
      status,
      location,
      quantity,
      productId,
      serviceId,
      userId
    } = input

    if (typeof productStateId !== 'string') {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const statusValue =
      typeof status === 'string' &&
      Object.values(ProductStateStatus).includes(status as ProductStateStatus)
        ? (status as ProductStateStatus)
        : undefined

    const locationValue =
      typeof location === 'string' &&
      Object.values(ProductStateLocation).includes(
        location as ProductStateLocation
      )
        ? (location as ProductStateLocation)
        : undefined

    const quantityValue =
      typeof quantity === 'number' && quantity >= 0 ? quantity : undefined

    const { productState, code } =
      await this.productStateService.updateProductState({
        productStateId,
        status: statusValue,
        location: locationValue,
        quantity: quantityValue,
        productId: typeof productId === 'string' ? productId : undefined,
        serviceId: typeof serviceId === 'string' ? serviceId : null,
        userId: typeof userId === 'string' ? userId : null
      })

    if (!productState) {
      return next({ code })
    }

    return next({ data: productState, code })
  }

  deleteProductState = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { productStateId } = input

    const { code } = await this.productStateService.deleteProductState({
      productStateId
    })

    return next({ code })
  }
}

