import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'

import { ResponseCode } from '../../interface'
import { ProductsService } from './productsService'

@autoInjectable()
export class ProductsController {
  private readonly productsService: ProductsService

  constructor(productsService: ProductsService) {
    this.productsService = productsService
  }

  listProducts = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { page, limit, search, acquisitionType } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null

    const { products, pagination, code } =
      await this.productsService.listProducts({
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm,
        acquisitionType
      })

    if (!products || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        products,
        pagination
      },
      code
    })
  }

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { productId } = input

    const { product, code } = await this.productsService.getProductById({
      productId
    })

    if (!product) {
      return next({ code })
    }

    return next({ data: product, code })
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      name,
      size,
      unit,
      quantityPerUnit,
      transportationUnit,
      unitsPerTransportationUnit,
      description,
      acquisitionType,
      imageIds,
      prices,
      servicePrices,
      productStates
    } = input

    const { product, code } = await this.productsService.createProduct({
      name,
      size,
      unit,
      quantityPerUnit,
      transportationUnit,
      unitsPerTransportationUnit,
      description,
      acquisitionType,
      imageIds,
      prices,
      servicePrices,
      productStates
    })

    if (!product) {
      return next({ code })
    }

    return next({ data: product, code })
  }

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      productId,
      name,
      size,
      unit,
      quantityPerUnit,
      transportationUnit,
      unitsPerTransportationUnit,
      description,
      acquisitionType,
      imageIdsToAdd,
      imageIdsToRemove,
      prices,
      servicePrices,
      productStates
    } = input

    const { product, code } = await this.productsService.updateProduct({
      productId,
      name,
      size,
      unit,
      quantityPerUnit,
      transportationUnit,
      unitsPerTransportationUnit,
      description,
      acquisitionType,
      imageIdsToAdd,
      imageIdsToRemove,
      prices,
      servicePrices,
      productStates
    })

    if (!product) {
      return next({ code })
    }

    return next({ data: product, code })
  }

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { productId } = input

    const { code } = await this.productsService.deleteProduct({
      productId
    })

    return next({ code })
  }

  getAllProductPrices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { acquisitionType } = input

    const { data, code } = await this.productsService.getAllProductPrices({
      acquisitionType
    })

    return next({ data, code })
  }

  getAllProductServicePrices = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { productId } = input

    const { data, code } =
      await this.productsService.getAllProductServicePrices(productId)

    return next({ data, code })
  }
}
