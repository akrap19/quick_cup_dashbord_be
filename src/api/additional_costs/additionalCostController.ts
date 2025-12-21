import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { ResponseCode } from '../../interface'
import { AdditionalCostsService } from './additionalCostService'
import { MethodOfPayment, BillingType } from './interface'
import { AcquisitionType } from '../products/interface'

@autoInjectable()
export class AdditionalCostsController {
  private readonly additionalCostsService: AdditionalCostsService

  constructor(additionalCostsService: AdditionalCostsService) {
    this.additionalCostsService = additionalCostsService
  }

  listAdditionalCosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { page, limit, search, methodOfPayment, billingType, acquisitionType } =
      input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null
    const methodOfPaymentFilter =
      typeof methodOfPayment === 'string' &&
      Object.values(MethodOfPayment).includes(methodOfPayment as MethodOfPayment)
        ? (methodOfPayment as MethodOfPayment)
        : null
    const billingTypeFilter =
      typeof billingType === 'string' &&
      Object.values(BillingType).includes(billingType as BillingType)
        ? (billingType as BillingType)
        : null
    const acquisitionTypeFilter =
      typeof acquisitionType === 'string' &&
      Object.values(AcquisitionType).includes(
        acquisitionType as AcquisitionType
      )
        ? (acquisitionType as AcquisitionType)
        : null

    const { additionalCosts, pagination, code } =
      await this.additionalCostsService.listAdditionalCosts({
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm,
        methodOfPayment: methodOfPaymentFilter,
        billingType: billingTypeFilter,
        acquisitionType: acquisitionTypeFilter
      })

    if (!additionalCosts || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        additionalCosts,
        pagination
      },
      code
    })
  }

  getAdditionalCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { additionalCostId } = input

    const { additionalCost, code } =
      await this.additionalCostsService.getAdditionalCostById({
        additionalCostId
      })

    if (!additionalCost) {
      return next({ code })
    }

    return next({ data: additionalCost, code })
  }

  createAdditionalCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { name, methodOfPayment, billingType, acquisitionType, price } = input

    const numericPrice =
      typeof price === 'number'
        ? price
        : price
        ? Number(price)
        : undefined

    if (typeof numericPrice !== 'number' || Number.isNaN(numericPrice)) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { additionalCost, code } =
      await this.additionalCostsService.createAdditionalCost({
        name,
        methodOfPayment,
        billingType,
        acquisitionType,
        price: numericPrice
      })

    if (!additionalCost) {
      return next({ code })
    }

    return next({ data: additionalCost, code })
  }

  updateAdditionalCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const {
      additionalCostId,
      name,
      methodOfPayment,
      billingType,
      acquisitionType,
      price
    } = input

    if (typeof additionalCostId !== 'string') {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const numericPrice =
      typeof price === 'number'
        ? price
        : price
        ? Number(price)
        : undefined

    if (
      typeof numericPrice !== 'undefined' &&
      (typeof numericPrice !== 'number' || Number.isNaN(numericPrice))
    ) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { additionalCost, code } =
      await this.additionalCostsService.updateAdditionalCost({
        additionalCostId,
        name,
        methodOfPayment,
        billingType,
        acquisitionType,
        price: numericPrice
      })

    if (!additionalCost) {
      return next({ code })
    }

    return next({ data: additionalCost, code })
  }

  deleteAdditionalCost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { additionalCostId } = input

    const { code } = await this.additionalCostsService.deleteAdditionalCost({
      additionalCostId
    })

    return next({ code })
  }
}

