import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'

import { ResponseCode } from '../../interface'
import { ProductsService } from './productsService'
import { RoleType } from '../role/interface'

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

    // Check if user is a client
    const isClient = req.user?.roles?.some(
      (userRole) => userRole.role.name === RoleType.CLIENT
    )
    const userId = isClient ? req.user?.id : undefined

    const { product, code } = await this.productsService.getProductById({
      productId,
      userId,
      isClient
    })

    if (!product) {
      return next({ code })
    }

    return next({ data: product, code })
  }

  getMyProducts = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { page, limit, search, userid } = input

    // Use userid from query parameter if provided, otherwise use logged-in user's ID
    let userId = userid
    if (!userId) {
      userId = req.user?.id
      if (!userId) {
        return next({ code: ResponseCode.UNAUTHORIZED })
      }
    }

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null

    const { products, pagination, code } =
      await this.productsService.getMyProducts({
        userId,
        page: pageNumber,
        limit: limitNumber,
        search: searchTerm
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
      designTemplateId,
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
      designTemplateId,
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
      designTemplateId,
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
      designTemplateId,
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

  calculateProductPrice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { productId, quantity, userId } = input

    const { data, code } = await this.productsService.calculateProductPrice({
      productId,
      quantity,
      userId
    })

    if (!data) {
      return next({ code })
    }

    return next({ data, code })
  }

  bulkUpdateProductStates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { updates } = input

    const { data, code } = await this.productsService.bulkUpdateProductStates({
      updates
    })

    if (!data) {
      return next({ code })
    }

    return next({ data, code })
  }

  downloadDesignTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const input = res.locals.input ?? {}
    const { productId } = input

    const result = await this.productsService.downloadDesignTemplate({
      productId
    })

    if (!result.data) {
      return next({ code: result.code })
    }

    // Type guard: check if data has the expected structure
    const fileData = result.data as {
      buffer: Buffer
      fileName: string
      mimeType: string
    }
    if (!fileData.buffer || !fileData.fileName || !fileData.mimeType) {
      return next({ code: result.code })
    }

    const { buffer, fileName, mimeType } = fileData

    // Set headers for file download
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Content-Length', buffer.length.toString())

    // Send the file buffer
    res.send(buffer)
  }
}
