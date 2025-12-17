import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { ServiceLocationService } from './serviceLocationService'

@autoInjectable()
export class ServiceLocationController {
  private readonly serviceLocationService: ServiceLocationService

  constructor(serviceLocationService: ServiceLocationService) {
    this.serviceLocationService = serviceLocationService
  }

  listServiceLocations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { page, limit, search, serviceId } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null
    const serviceIdString =
      typeof serviceId === 'string' ? serviceId : undefined

    const { serviceLocations, pagination, code } =
      await this.serviceLocationService.listServiceLocations({
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm,
        serviceId: serviceIdString
      })

    if (!serviceLocations || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        serviceLocations,
        pagination
      },
      code
    })
  }

  getServiceLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { serviceLocationId } = input

    const { serviceLocation, code } =
      await this.serviceLocationService.getServiceLocationById({
        serviceLocationId
      })

    if (!serviceLocation) {
      return next({ code })
    }

    return next({ data: serviceLocation, code })
  }

  createServiceLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { city, address, phone, email, serviceId } = res.locals.input
    const { id } = req.user

    const { serviceLocation, code } =
      await this.serviceLocationService.createServiceLocation({
        city,
        address,
        phone,
        email,
        serviceId,
        assignedById: id
      })

    if (!serviceLocation) {
      return next({ code })
    }

    return next({ data: serviceLocation, code })
  }

  updateServiceLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { serviceLocationId, city, address, phone, email, serviceId } = input

    const { serviceLocation, code } =
      await this.serviceLocationService.updateServiceLocation({
        serviceLocationId,
        city,
        address,
        phone,
        email,
        serviceId
      })

    if (!serviceLocation) {
      return next({ code })
    }

    return next({ data: serviceLocation, code })
  }

  deleteServiceLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { serviceLocationId } = input

    const { code } = await this.serviceLocationService.deleteServiceLocation({
      serviceLocationId
    })

    return next({ code })
  }
}
