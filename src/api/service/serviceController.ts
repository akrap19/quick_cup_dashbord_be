import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { ResponseCode } from '../../interface'
import { ServicesService } from './serviceService'

@autoInjectable()
export class ServicesController {
  private readonly servicesService: ServicesService

  constructor(servicesService: ServicesService) {
    this.servicesService = servicesService
  }

  listServices = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { page, limit, search } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null

    const { services, pagination, code } =
      await this.servicesService.listServices({
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm
      })

    if (!services || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        services,
        pagination
      },
      code
    })
  }

  getService = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { serviceId } = input

    const { service, code } = await this.servicesService.getServiceById({
      serviceId
    })

    if (!service) {
      return next({ code })
    }

    return next({ data: service, code })
  }

  createService = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      name,
      description,
      priceCalculationUnit,
      acquisitionType,
      billingInterval,
      isDefaultServiceForBuy,
      isDefaultServiceForRent,
      inputTypeForBuy,
      inputTypeForRent,
      buyPrices,
      rentPrices
    } = input

    const { service, code } = await this.servicesService.createService({
      name,
      description,
      priceCalculationUnit,
      acquisitionType,
      billingInterval,
      isDefaultServiceForBuy,
      isDefaultServiceForRent,
      inputTypeForBuy,
      inputTypeForRent,
      buyPrices,
      rentPrices
    })

    if (!service) {
      return next({ code })
    }

    return next({ data: service, code })
  }

  updateService = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      serviceId,
      name,
      description,
      priceCalculationUnit,
      acquisitionType,
      billingInterval,
      isDefaultServiceForBuy,
      isDefaultServiceForRent,
      inputTypeForBuy,
      inputTypeForRent,
      buyPrices,
      rentPrices
    } = input

    const { service, code } = await this.servicesService.updateService({
      serviceId,
      name,
      description,
      priceCalculationUnit,
      acquisitionType,
      billingInterval,
      isDefaultServiceForBuy,
      isDefaultServiceForRent,
      inputTypeForBuy,
      inputTypeForRent,
      buyPrices,
      rentPrices
    })

    if (!service) {
      return next({ code })
    }

    return next({ data: service, code })
  }

  deleteService = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { serviceId } = input

    const { code } = await this.servicesService.deleteService({
      serviceId
    })

    return next({ code })
  }

  getAllServicePrices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { acquisitionType } = input

    const { data, code } = await this.servicesService.getAllServicePrices({
      acquisitionType
    })

    return next({ data, code })
  }

  calculateServicePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { serviceId, productId, quantity, acquisitionType } = input

    const { data, code } = await this.servicesService.calculateServicePrice({
      serviceId,
      productId,
      quantity,
      acquisitionType
    })

    if (!data) {
      return next({ code })
    }

    return next({ data, code })
  }

  calculateServicePriceForMultipleProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { serviceId, products, acquisitionType } = input

    const { data, code } =
      await this.servicesService.calculateServicePriceForMultipleProducts({
        serviceId,
        products,
        acquisitionType
      })

    if (!data) {
      return next({ code })
    }

    return next({ data, code })
  }

  getAllServiceLocations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { data, code } = await this.servicesService.getAllServiceLocations()

    if (!data) {
      return next({ code })
    }

    return next({ data, code })
  }
}
