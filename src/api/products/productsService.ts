import { Repository, In } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  AcquisitionType,
  IAllProductPrices,
  ICreateProduct,
  IDeleteProduct,
  IGetAllProductPrices,
  IGetProductById,
  IListProducts,
  IProductService,
  IProductsPagination,
  IUpdateProduct
} from './interface'
import { Product } from './productsModel'
import { ProductMedia } from './productsMediaModel'
import { ProductPrice } from './productPriceModel'
import { ProductServicePrice } from './productServicePriceModel'
import { Media } from '../media/mediaModel'
import { ClientProductPrice } from '../client/clientProductPriceModel'
import { ProductState } from '../product_state/productStateModel'
import {
  ProductStateStatus,
  ProductStateLocation
} from '../product_state/interface'
import {
  ServiceModel,
  AcquisitionType as ServiceAcquisitionType
} from '../service/serviceModel'
import { ServicePrice } from '../service/servicePriceModel'
import { getFileURL, deleteFile } from '../../services/cpanel'

type ListProductsResponse = Awaited<AsyncResponse<IProductsPagination>>
type ProductResponse = Awaited<AsyncResponse<Product>>
type DeleteProductResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ProductsService implements IProductService {
  private readonly productRepository: Repository<Product>
  private readonly productMediaRepository: Repository<ProductMedia>
  private readonly productPriceRepository: Repository<ProductPrice>
  private readonly productServicePriceRepository: Repository<ProductServicePrice>
  private readonly mediaRepository: Repository<Media>
  private readonly clientProductPriceRepository: Repository<ClientProductPrice>
  private readonly serviceRepository: Repository<ServiceModel>
  private readonly servicePriceRepository: Repository<ServicePrice>
  private readonly productStateRepository: Repository<ProductState>

  constructor() {
    this.productRepository = AppDataSource.manager.getRepository(Product)
    this.productMediaRepository =
      AppDataSource.manager.getRepository(ProductMedia)
    this.productPriceRepository =
      AppDataSource.manager.getRepository(ProductPrice)
    this.productServicePriceRepository =
      AppDataSource.manager.getRepository(ProductServicePrice)
    this.mediaRepository = AppDataSource.manager.getRepository(Media)
    this.clientProductPriceRepository =
      AppDataSource.manager.getRepository(ClientProductPrice)
    this.serviceRepository = AppDataSource.manager.getRepository(ServiceModel)
    this.servicePriceRepository =
      AppDataSource.manager.getRepository(ServicePrice)
    this.productStateRepository =
      AppDataSource.manager.getRepository(ProductState)
  }

  private validatePriceTiers(
    tiers: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  ): { valid: boolean; error?: string } {
    // Sort tiers by minQuantity
    const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity)

    for (let i = 0; i < sortedTiers.length; i++) {
      const current = sortedTiers[i]

      // Validate maxQuantity >= minQuantity if provided
      if (
        current.maxQuantity !== null &&
        current.maxQuantity !== undefined &&
        current.maxQuantity < current.minQuantity
      ) {
        return {
          valid: false,
          error: `Price tier at index ${i} has maxQuantity less than minQuantity`
        }
      }

      // Check for overlaps with next tier
      if (i < sortedTiers.length - 1) {
        const next = sortedTiers[i + 1]
        const currentMax = current.maxQuantity ?? Infinity

        if (currentMax >= next.minQuantity) {
          return {
            valid: false,
            error: `Price tiers overlap: tier ending at ${currentMax} overlaps with tier starting at ${next.minQuantity}`
          }
        }
      }
    }

    return { valid: true }
  }

  listProducts = async ({
    search,
    page = 1,
    limit = 25,
    acquisitionType,
    queryRunner
  }: IListProducts): AsyncResponse<IProductsPagination> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const query = repository.createQueryBuilder('product')

      if (typeof acquisitionType === 'string') {
        query.andWhere('product.acquisitionType = :acquisitionType', {
          acquisitionType
        })
      }

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere('(LOWER(product.name) LIKE :searchLike)', { searchLike })
      }

      const offset = (currentPage - 1) * currentLimit

      const [products, count] = await query
        .leftJoinAndSelect('product.images', 'images')
        .leftJoinAndSelect('images.media', 'media')
        .leftJoinAndSelect('product.prices', 'prices')
        .leftJoinAndSelect('product.productStates', 'productStates')
        .leftJoinAndSelect('productStates.service', 'stateService')
        .leftJoinAndSelect('productStates.user', 'stateUser')
        .orderBy('product.createdAt', 'DESC')
        .addOrderBy('prices.minQuantity', 'ASC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      // Get all services with their default prices (fetch once for efficiency)
      const allServices = await this.serviceRepository.find({
        relations: ['prices'],
        order: { id: 'ASC' }
      })

      // Get all product-specific service prices for products in this page
      const productIds = products.map((p) => p.id)
      const allProductServicePrices =
        productIds.length > 0
          ? await this.productServicePriceRepository.find({
              where: { productId: In(productIds) },
              relations: ['service'],
              order: { productId: 'ASC', serviceId: 'ASC', minQuantity: 'ASC' }
            })
          : []

      // Group product service prices by productId and serviceId
      const productServicePricesMap = new Map<
        string,
        Map<string, ProductServicePrice[]>
      >()
      allProductServicePrices.forEach((price) => {
        if (!productServicePricesMap.has(price.productId)) {
          productServicePricesMap.set(price.productId, new Map())
        }
        const productMap = productServicePricesMap.get(price.productId)!
        if (!productMap.has(price.serviceId)) {
          productMap.set(price.serviceId, [])
        }
        productMap.get(price.serviceId)!.push(price)
      })

      // Transform products to include image URLs, sorted prices, and service prices
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          const images = product.images
            ? await Promise.all(
                product.images.map(async (img: ProductMedia) => {
                  const url = await getFileURL(img.media.url)
                  return {
                    id: img.id,
                    mediaId: img.media.id,
                    name: img.media.name,
                    url: url || img.media.url,
                    createdAt: img.createdAt
                  }
                })
              )
            : []

          // Sort prices by minQuantity
          const prices = product.prices
            ? [...product.prices].sort((a, b) => a.minQuantity - b.minQuantity)
            : []

          // Filter services by product's acquisition type
          const filteredServices = allServices.filter((service) => {
            if (!service.acquisitionType) {
              return false
            }
            // If service has 'both', include it for any product acquisition type
            if (service.acquisitionType === ServiceAcquisitionType.BOTH) {
              return true
            }
            // Otherwise, only include if service acquisition type matches product acquisition type
            const productAcquisitionTypeAsService =
              product.acquisitionType === AcquisitionType.BUY
                ? ServiceAcquisitionType.BUY
                : ServiceAcquisitionType.RENT
            return service.acquisitionType === productAcquisitionTypeAsService
          })

          // Get product-specific service prices for this product
          const productServicePricesForProduct =
            productServicePricesMap.get(product.id) || new Map()

          // Determine which acquisition type to use based on product
          const relevantAcquisitionType =
            product.acquisitionType === AcquisitionType.BUY
              ? ServiceAcquisitionType.BUY
              : ServiceAcquisitionType.RENT

          // Build servicePrices: use product service prices if available, otherwise use default service prices
          const servicePrices = filteredServices.map((service) => {
            const productServicePricesForService =
              productServicePricesForProduct.get(service.id)

            // If product has custom prices for this service, use those
            if (
              productServicePricesForService &&
              productServicePricesForService.length > 0
            ) {
              return {
                serviceId: service.id,
                serviceName: service.name || '',
                billingInterval: service.billingInterval ?? null,
                isDefaultServiceForBuy: service.isDefaultServiceForBuy ?? null,
                isDefaultServiceForRent:
                  service.isDefaultServiceForRent ?? null,
                inputTypeForBuy: service.inputTypeForBuy ?? null,
                inputTypeForRent: service.inputTypeForRent ?? null,
                prices: productServicePricesForService.map(
                  (price: ProductServicePrice) => ({
                    id: price.id,
                    minQuantity: price.minQuantity,
                    maxQuantity: price.maxQuantity ?? null,
                    price: price.price,
                    createdAt: price.createdAt,
                    updatedAt: price.updatedAt
                  })
                )
              }
            }

            // Otherwise, use default service prices filtered by product's acquisition type
            const allDefaultPrices = service.prices || []
            const defaultPrices = allDefaultPrices
              .filter((p) => p.acquisitionType === relevantAcquisitionType)
              .sort((a, b) => a.minQuantity - b.minQuantity)

            return {
              serviceId: service.id,
              serviceName: service.name || '',
              billingInterval: service.billingInterval ?? null,
              isDefaultServiceForBuy: service.isDefaultServiceForBuy ?? null,
              isDefaultServiceForRent: service.isDefaultServiceForRent ?? null,
              inputTypeForBuy: service.inputTypeForBuy ?? null,
              inputTypeForRent: service.inputTypeForRent ?? null,
              prices: defaultPrices.map((price) => ({
                id: price.id,
                minQuantity: price.minQuantity,
                maxQuantity: price.maxQuantity ?? null,
                price: price.price,
                createdAt: price.createdAt,
                updatedAt: price.updatedAt
              }))
            }
          })

          // Get product states
          const productStates = product.productStates
            ? product.productStates.map((state) => ({
                id: state.id,
                status: state.status,
                location: state.location,
                quantity: state.quantity,
                serviceId: state.serviceId ?? null,
                service: state.service
                  ? {
                      id: state.service.id,
                      name: state.service.name
                    }
                  : null,
                userId: state.userId ?? null,
                user: state.user
                  ? {
                      id: state.user.id,
                      firstName: state.user.firstName,
                      lastName: state.user.lastName,
                      email: state.user.email
                    }
                  : null,
                createdAt: state.createdAt,
                updatedAt: state.updatedAt
              }))
            : []

          return {
            ...product,
            images,
            prices,
            servicePrices,
            productStates
          }
        })
      )

      const response = {
        products: productsWithImages,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListProductsResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListProductsResponse
  }

  getProductById = async ({
    productId,
    queryRunner
  }: IGetProductById): AsyncResponse<Product> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const product = await repository.findOne({
        where: { id: productId },
        relations: [
          'images',
          'images.media',
          'prices',
          'productStates',
          'productStates.service',
          'productStates.user'
        ]
      })

      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Transform images to include URLs
      const images = product.images
        ? await Promise.all(
            product.images.map(async (img: ProductMedia) => {
              const url = await getFileURL(img.media.url)
              return {
                id: img.id,
                mediaId: img.media.id,
                name: img.media.name,
                url: url || img.media.url,
                createdAt: img.createdAt
              }
            })
          )
        : []

      // Sort prices by minQuantity
      const prices = product.prices
        ? [...product.prices].sort((a, b) => a.minQuantity - b.minQuantity)
        : []

      // Get all services with their default prices
      const allServices = await this.serviceRepository.find({
        relations: ['prices'],
        order: { id: 'ASC' }
      })

      // Filter services by product's acquisition type
      // Only include services where service.acquisitionType matches product.acquisitionType or is 'both'
      const filteredServices = allServices.filter((service) => {
        if (!service.acquisitionType) {
          return false
        }
        // If service has 'both', include it for any product acquisition type
        if (service.acquisitionType === ServiceAcquisitionType.BOTH) {
          return true
        }
        // Otherwise, only include if service acquisition type matches product acquisition type
        // Convert product acquisition type to service acquisition type for comparison
        const productAcquisitionTypeAsService =
          product.acquisitionType === AcquisitionType.BUY
            ? ServiceAcquisitionType.BUY
            : ServiceAcquisitionType.RENT
        return service.acquisitionType === productAcquisitionTypeAsService
      })

      // Get product-specific service prices
      const productServicePrices =
        await this.productServicePriceRepository.find({
          where: { productId },
          relations: ['service'],
          order: { serviceId: 'ASC', minQuantity: 'ASC' }
        })

      // Create a map of product service prices by serviceId
      const productServicePricesMap = new Map<string, ProductServicePrice[]>()
      productServicePrices.forEach((price) => {
        if (!productServicePricesMap.has(price.serviceId)) {
          productServicePricesMap.set(price.serviceId, [])
        }
        productServicePricesMap.get(price.serviceId)!.push(price)
      })

      // Determine which acquisition type to use based on product
      const relevantAcquisitionType =
        product.acquisitionType === AcquisitionType.BUY
          ? ServiceAcquisitionType.BUY
          : ServiceAcquisitionType.RENT

      // Build servicePrices: use product service prices if available, otherwise use default service prices
      const servicePrices = filteredServices.map((service) => {
        const productServicePricesForService = productServicePricesMap.get(
          service.id
        )

        // If product has custom prices for this service, use those
        if (
          productServicePricesForService &&
          productServicePricesForService.length > 0
        ) {
          return {
            serviceId: service.id,
            serviceName: service.name || '',
            prices: productServicePricesForService.map((price) => ({
              id: price.id,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price,
              createdAt: price.createdAt,
              updatedAt: price.updatedAt
            }))
          }
        }

        // Otherwise, use default service prices filtered by product's acquisition type
        const allDefaultPrices = service.prices || []
        const defaultPrices = allDefaultPrices
          .filter((p) => p.acquisitionType === relevantAcquisitionType)
          .sort((a, b) => a.minQuantity - b.minQuantity)

        return {
          serviceId: service.id,
          serviceName: service.name || '',
          prices: defaultPrices.map((price) => ({
            id: price.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price,
            createdAt: price.createdAt,
            updatedAt: price.updatedAt
          }))
        }
      })

      // Get product states
      const productStates = product.productStates
        ? product.productStates.map((state) => ({
            id: state.id,
            status: state.status,
            location: state.location,
            quantity: state.quantity,
            serviceId: state.serviceId ?? null,
            service: state.service
              ? {
                  id: state.service.id,
                  name: state.service.name
                }
              : null,
            userId: state.userId ?? null,
            user: state.user
              ? {
                  id: state.user.id,
                  firstName: state.user.firstName,
                  lastName: state.user.lastName,
                  email: state.user.email
                }
              : null,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt
          }))
        : []

      const productWithImages = {
        ...product,
        images,
        prices,
        servicePrices,
        productStates
      }

      return { product: productWithImages, code } as unknown as ProductResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductResponse
  }

  createProduct = async ({
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
    productStates,
    queryRunner
  }: ICreateProduct): AsyncResponse<Product> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const product = repository.create({
        name,
        size: size ?? undefined,
        unit: unit ?? undefined,
        quantityPerUnit: quantityPerUnit ?? undefined,
        transportationUnit: transportationUnit ?? undefined,
        unitsPerTransportationUnit: unitsPerTransportationUnit ?? undefined,
        description: description ?? null,
        acquisitionType
      })

      const savedProduct = await repository.save(product)

      // Validate and create prices if provided
      if (prices && prices.length > 0) {
        const validation = this.validatePriceTiers(prices)
        if (!validation.valid) {
          return { code: ResponseCode.BAD_REQUEST }
        }

        const productPriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductPrice)
          : this.productPriceRepository

        const priceRecords = prices.map((price) =>
          productPriceRepository.create({
            productId: savedProduct.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price
          })
        )

        try {
          await productPriceRepository.save(priceRecords)
        } catch (saveErr: any) {
          logger.error({
            code: ResponseCode.SERVER_ERROR,
            message: 'Failed to save product prices',
            stack: saveErr.stack
          })
          throw saveErr
        }
      }

      // Create product service prices if provided
      if (servicePrices && servicePrices.length > 0) {
        const productServicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductServicePrice)
          : this.productServicePriceRepository

        for (const servicePrice of servicePrices) {
          // Validate price tiers
          const validation = this.validatePriceTiers(servicePrice.prices)
          if (!validation.valid) {
            return { code: ResponseCode.BAD_REQUEST }
          }

          // Create price records
          const priceRecords = servicePrice.prices.map((price) =>
            productServicePriceRepository.create({
              productId: savedProduct.id,
              serviceId: servicePrice.serviceId,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price
            })
          )

          try {
            await productServicePriceRepository.save(priceRecords)
          } catch (saveErr: any) {
            logger.error({
              code: ResponseCode.SERVER_ERROR,
              message: 'Failed to save product service prices',
              stack: saveErr.stack
            })
            throw saveErr
          }
        }
      }

      // Create product states if provided
      if (productStates && productStates.length > 0) {
        const productStateRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductState)
          : this.productStateRepository

        for (const state of productStates) {
          // Validate location-specific fields
          if (
            state.location === ProductStateLocation.SERVICE &&
            !state.serviceId
          ) {
            return { code: ResponseCode.INVALID_INPUT }
          }
          if (state.location === ProductStateLocation.USER && !state.userId) {
            return { code: ResponseCode.INVALID_INPUT }
          }
          if (state.location === ProductStateLocation.SERVICE && state.userId) {
            return { code: ResponseCode.INVALID_INPUT }
          }
          if (state.location === ProductStateLocation.USER && state.serviceId) {
            return { code: ResponseCode.INVALID_INPUT }
          }

          const productState = productStateRepository.create({
            status: state.status as ProductStateStatus,
            location: state.location as ProductStateLocation,
            quantity: state.quantity,
            productId: savedProduct.id,
            serviceId:
              state.location === ProductStateLocation.SERVICE
                ? state.serviceId
                : null,
            userId:
              state.location === ProductStateLocation.USER ? state.userId : null
          })

          try {
            await productStateRepository.save(productState)
          } catch (saveErr: any) {
            logger.error({
              code: ResponseCode.SERVER_ERROR,
              message: 'Failed to save product state',
              stack: saveErr.stack
            })
            throw saveErr
          }
        }
      }

      // Associate images if provided
      if (imageIds && imageIds.length > 0) {
        const productMediaRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductMedia)
          : this.productMediaRepository

        // Remove duplicates from imageIds
        const uniqueImageIds = [...new Set(imageIds)]

        // Verify all media exist
        const mediaRepository = queryRunner
          ? queryRunner.manager.getRepository(Media)
          : this.mediaRepository

        const mediaRecords = await mediaRepository.findBy({
          id: In(uniqueImageIds)
        })
        if (mediaRecords.length !== uniqueImageIds.length) {
          // Some media IDs don't exist
          return { code: ResponseCode.MEDIA_NOT_FOUND }
        }

        // Create ProductMedia associations
        const productMediaRecords = uniqueImageIds.map((mediaId) =>
          productMediaRepository.create({
            productId: savedProduct.id,
            mediaId
          })
        )

        try {
          await productMediaRepository.save(productMediaRecords)
        } catch (saveErr: any) {
          // Handle duplicate entry error (shouldn't happen with uniqueImageIds, but just in case)
          if (saveErr.code === 'ER_DUP_ENTRY' || saveErr.errno === 1062) {
            code = ResponseCode.CONFLICT_DUPLICATE_FILE
            logger.warn({
              code,
              message: 'Duplicate image association attempted',
              stack: saveErr.stack
            })
          } else {
            throw saveErr
          }
        }
      }

      // Reload product with images, prices, and product states
      const productWithImages = await repository.findOne({
        where: { id: savedProduct.id },
        relations: [
          'images',
          'images.media',
          'prices',
          'productStates',
          'productStates.service',
          'productStates.user'
        ]
      })

      if (!productWithImages) {
        return { product: savedProduct, code } as unknown as ProductResponse
      }

      // Transform images to include URLs
      const images = productWithImages.images
        ? await Promise.all(
            productWithImages.images.map(async (img: ProductMedia) => {
              const url = await getFileURL(img.media.url)
              return {
                id: img.id,
                mediaId: img.media.id,
                name: img.media.name,
                url: url || img.media.url,
                createdAt: img.createdAt
              }
            })
          )
        : []

      // Sort prices by minQuantity
      const sortedPrices = productWithImages.prices
        ? [...productWithImages.prices].sort(
            (a, b) => a.minQuantity - b.minQuantity
          )
        : []

      // Get product states
      const transformedProductStates = productWithImages.productStates
        ? productWithImages.productStates.map((state) => ({
            id: state.id,
            status: state.status,
            location: state.location,
            quantity: state.quantity,
            serviceId: state.serviceId ?? null,
            service: state.service
              ? {
                  id: state.service.id,
                  name: state.service.name
                }
              : null,
            userId: state.userId ?? null,
            user: state.user
              ? {
                  id: state.user.id,
                  firstName: state.user.firstName,
                  lastName: state.user.lastName,
                  email: state.user.email
                }
              : null,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt
          }))
        : []

      const productResponse = {
        ...productWithImages,
        images,
        prices: sortedPrices,
        productStates: transformedProductStates
      }

      return { product: productResponse, code } as unknown as ProductResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductResponse
  }

  updateProduct = async ({
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
    productStates,
    queryRunner
  }: IUpdateProduct): AsyncResponse<Product> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      // Verify product exists
      const product = await repository.findOne({ where: { id: productId } })
      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const updateData: Partial<Product> = {}

      if (typeof name !== 'undefined') {
        updateData.name = name
      }

      if (typeof size !== 'undefined') {
        updateData.size = size ?? undefined
      }

      if (typeof unit !== 'undefined') {
        updateData.unit = unit ?? undefined
      }

      if (typeof quantityPerUnit !== 'undefined') {
        updateData.quantityPerUnit = quantityPerUnit ?? undefined
      }

      if (typeof transportationUnit !== 'undefined') {
        updateData.transportationUnit = transportationUnit ?? undefined
      }

      if (typeof unitsPerTransportationUnit !== 'undefined') {
        updateData.unitsPerTransportationUnit =
          unitsPerTransportationUnit ?? undefined
      }

      if (typeof acquisitionType !== 'undefined') {
        updateData.acquisitionType = acquisitionType
      }

      if (typeof description !== 'undefined') {
        updateData.description = description ?? null
      }

      // Update product fields if any
      if (Object.keys(updateData).length > 0) {
        await repository
          .createQueryBuilder()
          .update(Product)
          .set(updateData)
          .where('id = :productId', { productId })
          .execute()
      }

      const productMediaRepository = queryRunner
        ? queryRunner.manager.getRepository(ProductMedia)
        : this.productMediaRepository

      // Remove images if specified
      if (imageIdsToRemove && imageIdsToRemove.length > 0) {
        // Remove duplicates
        const uniqueImageIdsToRemove = [...new Set(imageIdsToRemove)]

        // Try to find ProductMedia records by ID first (in case frontend sends ProductMedia IDs)
        const productMediaByIds = await productMediaRepository.find({
          where: {
            id: In(uniqueImageIdsToRemove),
            productId
          },
          relations: ['media']
        })

        // Also try to find by mediaId (in case frontend sends Media IDs)
        const productMediaByMediaIds = await productMediaRepository.find({
          where: {
            productId,
            mediaId: In(uniqueImageIdsToRemove)
          },
          relations: ['media']
        })

        // Combine both results and remove duplicates
        const allProductMediaToRemove = [
          ...productMediaByIds,
          ...productMediaByMediaIds.filter(
            (pm) => !productMediaByIds.find((pm2) => pm2.id === pm.id)
          )
        ]

        if (allProductMediaToRemove.length === 0) {
          logger.warn({
            message: `No ProductMedia records found to remove`,
            productId,
            imageIdsToRemove: uniqueImageIdsToRemove
          })
        } else {
          // Get unique media IDs from the ProductMedia records we found
          const mediaIdsToRemove = [
            ...new Set(allProductMediaToRemove.map((pm) => pm.mediaId))
          ]

          logger.info({
            message: `Found ProductMedia records to remove`,
            productId,
            productMediaCount: allProductMediaToRemove.length,
            mediaIds: mediaIdsToRemove
          })

          // Check which media are used by other products
          const mediaUsedByOtherProducts = await productMediaRepository
            .createQueryBuilder('pm')
            .where('pm.media_id IN (:...mediaIds)', {
              mediaIds: mediaIdsToRemove
            })
            .andWhere('pm.product_id != :productId', { productId })
            .getMany()

          const mediaIdsUsedByOthers = new Set(
            mediaUsedByOtherProducts.map((pm) => pm.mediaId)
          )

          // Store media info for deletion after removing ProductMedia records
          const mediaToDelete: Array<{ id: string; url: string }> = []
          for (const productMedia of allProductMediaToRemove) {
            const mediaId = productMedia.mediaId
            // If media is not used by other products, mark it for deletion
            if (!mediaIdsUsedByOthers.has(mediaId) && productMedia.media?.url) {
              mediaToDelete.push({
                id: mediaId,
                url: productMedia.media.url
              })
            }
          }

          // Delete ProductMedia records by their IDs (more precise)
          const productMediaIdsToDelete = allProductMediaToRemove.map(
            (pm) => pm.id
          )

          const deleteResult = await productMediaRepository
            .createQueryBuilder()
            .delete()
            .from(ProductMedia)
            .where('id IN (:...productMediaIds)', {
              productMediaIds: productMediaIdsToDelete
            })
            .execute()

          logger.info({
            message: `Deleted ProductMedia records`,
            productId,
            deletedCount: deleteResult.affected || 0,
            productMediaIds: productMediaIdsToDelete
          })

          // Delete files from server and Media records for media not used by other products
          const mediaRepository = queryRunner
            ? queryRunner.manager.getRepository(Media)
            : this.mediaRepository

          for (const media of mediaToDelete) {
            try {
              // Delete file from server
              await deleteFile(media.url)
              logger.info({
                message: `Deleted file from server: ${media.url}`,
                productId,
                mediaId: media.id
              })

              // Delete the Media record
              await mediaRepository.delete({ id: media.id })
              logger.info({
                message: `Deleted media record: ${media.id}`,
                productId,
                mediaId: media.id
              })
            } catch (fileErr: any) {
              // Log error but don't fail the deletion
              logger.error({
                code: ResponseCode.SERVER_ERROR,
                message: `Failed to delete file from server: ${media.url}`,
                stack: fileErr.stack,
                productId,
                mediaId: media.id
              })
            }
          }
        }
      }

      // Add images if specified
      if (imageIdsToAdd && imageIdsToAdd.length > 0) {
        // Remove duplicates
        const uniqueImageIdsToAdd = [...new Set(imageIdsToAdd)]

        // Verify all media exist
        const mediaRepository = queryRunner
          ? queryRunner.manager.getRepository(Media)
          : this.mediaRepository

        const mediaRecords = await mediaRepository.findBy({
          id: In(uniqueImageIdsToAdd)
        })
        if (mediaRecords.length !== uniqueImageIdsToAdd.length) {
          // Some media IDs don't exist
          return { code: ResponseCode.MEDIA_NOT_FOUND }
        }

        // Check which images are already associated
        const existingProductMedia = await productMediaRepository.find({
          where: {
            productId,
            mediaId: In(uniqueImageIdsToAdd)
          }
        })

        const existingMediaIds = existingProductMedia.map((pm) => pm.mediaId)
        const newImageIdsToAdd = uniqueImageIdsToAdd.filter(
          (id) => !existingMediaIds.includes(id)
        )

        // Create ProductMedia associations for new images
        if (newImageIdsToAdd.length > 0) {
          const productMediaRecords = newImageIdsToAdd.map((mediaId) =>
            productMediaRepository.create({
              productId,
              mediaId
            })
          )

          try {
            await productMediaRepository.save(productMediaRecords)
          } catch (saveErr: any) {
            // Handle duplicate entry error (shouldn't happen, but just in case)
            if (saveErr.code === 'ER_DUP_ENTRY' || saveErr.errno === 1062) {
              code = ResponseCode.CONFLICT_DUPLICATE_FILE
              logger.warn({
                code,
                message: 'Duplicate image association attempted',
                stack: saveErr.stack
              })
            } else {
              throw saveErr
            }
          }
        }
      }

      // Handle price operations if specified
      if (prices !== undefined) {
        const productPriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductPrice)
          : this.productPriceRepository

        // Validate prices if provided
        if (prices.length > 0) {
          const validation = this.validatePriceTiers(prices)
          if (!validation.valid) {
            return { code: ResponseCode.BAD_REQUEST }
          }
        }

        // Get existing prices
        const existingPrices = await productPriceRepository.find({
          where: { productId },
          order: { minQuantity: 'ASC' }
        })

        // Helper function to check if two prices match
        const pricesMatch = (
          existing: ProductPrice,
          provided: {
            minQuantity: number
            maxQuantity?: number | null
            price: number
          }
        ): boolean => {
          return (
            existing.minQuantity === provided.minQuantity &&
            (existing.maxQuantity ?? null) === (provided.maxQuantity ?? null) &&
            Math.abs(Number(existing.price) - provided.price) < 0.01 // Small tolerance for floating point comparison
          )
        }

        // Find prices to remove (existing prices that don't match any provided price)
        const pricesToRemove = existingPrices.filter(
          (existing) =>
            !prices.some((provided) => pricesMatch(existing, provided))
        )

        // Find prices to add (provided prices that don't match any existing price)
        const pricesToAdd = prices.filter(
          (provided) =>
            !existingPrices.some((existing) => pricesMatch(existing, provided))
        )

        // Remove prices that don't match
        if (pricesToRemove.length > 0) {
          const priceIdsToRemove = pricesToRemove.map((p) => p.id)
          const deleteResult = await productPriceRepository
            .createQueryBuilder()
            .delete()
            .from(ProductPrice)
            .where('id IN (:...priceIds)', { priceIds: priceIdsToRemove })
            .andWhere('product_id = :productId', { productId })
            .execute()

          logger.info({
            message: `Deleted product prices`,
            productId,
            deletedCount: deleteResult.affected || 0,
            priceIds: priceIdsToRemove
          })
        }

        if (pricesToAdd.length > 0) {
          const priceRecords = pricesToAdd.map((price) =>
            productPriceRepository.create({
              productId,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price
            })
          )

          try {
            await productPriceRepository.save(priceRecords)
          } catch (saveErr: any) {
            logger.error({
              code: ResponseCode.SERVER_ERROR,
              message: 'Failed to save product prices',
              stack: saveErr.stack
            })
            throw saveErr
          }
        }

        if (prices.length === 0 && existingPrices.length > 0) {
          const deleteResult = await productPriceRepository
            .createQueryBuilder()
            .delete()
            .from(ProductPrice)
            .where('product_id = :productId', { productId })
            .execute()

          logger.info({
            message: `Removed all product prices`,
            productId,
            deletedCount: deleteResult.affected || 0
          })
        }
      }

      // Handle product states if provided
      if (productStates !== undefined) {
        const productStateRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductState)
          : this.productStateRepository

        // Delete all existing product states for this product
        await productStateRepository.delete({ productId })

        // Create new product states if provided
        if (productStates && productStates.length > 0) {
          for (const state of productStates) {
            // Validate location-specific fields
            if (
              state.location === ProductStateLocation.SERVICE &&
              !state.serviceId
            ) {
              return { code: ResponseCode.INVALID_INPUT }
            }
            if (state.location === ProductStateLocation.USER && !state.userId) {
              return { code: ResponseCode.INVALID_INPUT }
            }
            if (
              state.location === ProductStateLocation.SERVICE &&
              state.userId
            ) {
              return { code: ResponseCode.INVALID_INPUT }
            }
            if (
              state.location === ProductStateLocation.USER &&
              state.serviceId
            ) {
              return { code: ResponseCode.INVALID_INPUT }
            }

            const productState = productStateRepository.create({
              status: state.status as ProductStateStatus,
              location: state.location as ProductStateLocation,
              quantity: state.quantity,
              productId,
              serviceId:
                state.location === ProductStateLocation.SERVICE
                  ? state.serviceId
                  : null,
              userId:
                state.location === ProductStateLocation.USER
                  ? state.userId
                  : null
            })

            try {
              await productStateRepository.save(productState)
            } catch (saveErr: any) {
              logger.error({
                code: ResponseCode.SERVER_ERROR,
                message: 'Failed to save product state',
                stack: saveErr.stack
              })
              throw saveErr
            }
          }
        }
      }

      // Handle service prices if provided
      if (servicePrices !== undefined) {
        const productServicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductServicePrice)
          : this.productServicePriceRepository

        // Delete all existing service prices for this product
        await productServicePriceRepository.delete({ productId })

        // Create new service prices if provided
        if (servicePrices && servicePrices.length > 0) {
          for (const servicePrice of servicePrices) {
            // Validate price tiers
            const validation = this.validatePriceTiers(servicePrice.prices)
            if (!validation.valid) {
              return { code: ResponseCode.BAD_REQUEST }
            }

            // Create price records
            const priceRecords = servicePrice.prices.map((price) =>
              productServicePriceRepository.create({
                productId,
                serviceId: servicePrice.serviceId,
                minQuantity: price.minQuantity,
                maxQuantity: price.maxQuantity ?? null,
                price: price.price
              })
            )

            try {
              await productServicePriceRepository.save(priceRecords)
            } catch (saveErr: any) {
              logger.error({
                code: ResponseCode.SERVER_ERROR,
                message: 'Failed to save product service prices',
                stack: saveErr.stack
              })
              throw saveErr
            }
          }
        }
      }

      // Reload product with images and prices
      const { product: updatedProduct, code: getCode } =
        await this.getProductById({
          productId,
          queryRunner
        })

      if (!updatedProduct) {
        return { code: getCode }
      }

      return { product: updatedProduct, code } as unknown as ProductResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductResponse
  }

  deleteProduct = async ({
    productId,
    queryRunner
  }: IDeleteProduct): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      // First, fetch the product with its images and media to get file paths
      const product = await repository.findOne({
        where: { id: productId },
        relations: ['images', 'images.media']
      })

      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Delete all custom prices for this product related to customers
      const clientProductPriceRepository = queryRunner
        ? queryRunner.manager.getRepository(ClientProductPrice)
        : this.clientProductPriceRepository

      const deleteClientPricesResult = await clientProductPriceRepository
        .createQueryBuilder()
        .delete()
        .from(ClientProductPrice)
        .where('product_id = :productId', { productId })
        .execute()

      logger.info({
        message: `Deleted client product prices for product`,
        productId,
        deletedCount: deleteClientPricesResult.affected || 0
      })

      // Delete associated image files from server
      if (product.images && product.images.length > 0) {
        const productMediaRepository = queryRunner
          ? queryRunner.manager.getRepository(ProductMedia)
          : this.productMediaRepository

        // Get all media IDs associated with this product
        const mediaIds = product.images.map((img) => img.mediaId)

        // Check which media are used by other products
        const mediaUsedByOtherProducts = await productMediaRepository
          .createQueryBuilder('pm')
          .where('pm.media_id IN (:...mediaIds)', { mediaIds })
          .andWhere('pm.product_id != :productId', { productId })
          .getMany()

        const mediaIdsUsedByOthers = new Set(
          mediaUsedByOtherProducts.map((pm) => pm.mediaId)
        )

        // Delete files for media that are not used by other products
        for (const img of product.images) {
          if (!mediaIdsUsedByOthers.has(img.mediaId) && img.media?.url) {
            try {
              await deleteFile(img.media.url)
              logger.info({
                message: `Deleted file from server: ${img.media.url}`,
                productId,
                mediaId: img.mediaId
              })
            } catch (fileErr: any) {
              // Log error but don't fail the deletion
              logger.error({
                code: ResponseCode.SERVER_ERROR,
                message: `Failed to delete file from server: ${img.media.url}`,
                stack: fileErr.stack,
                productId,
                mediaId: img.mediaId
              })
            }
          }
        }
      }

      // Delete the product (this will cascade delete ProductMedia records)
      const result = await repository.delete({ id: productId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteProductResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteProductResponse
  }

  getAllProductPrices = async ({
    acquisitionType
  }: IGetAllProductPrices): AsyncResponse<IAllProductPrices[]> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const query = this.productPriceRepository
        .createQueryBuilder('price')
        .leftJoinAndSelect('price.product', 'product')
        .orderBy('price.productId', 'ASC')
        .addOrderBy('price.minQuantity', 'ASC')

      if (typeof acquisitionType === 'string') {
        query.andWhere('product.acquisitionType = :acquisitionType', {
          acquisitionType
        })
      }

      const prices = await query.getMany()

      // Group by productId
      const groupedPrices = prices.reduce(
        (acc, price) => {
          if (!acc[price.productId]) {
            acc[price.productId] = {
              productId: price.productId,
              productName: price.product?.name || '',
              size: price.product?.size || null,
              acquisitionType:
                price.product?.acquisitionType || AcquisitionType.BUY,
              prices: []
            }
          }
          acc[price.productId].prices.push({
            id: price.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price,
            createdAt: price.createdAt,
            updatedAt: price.updatedAt
          })
          return acc
        },
        {} as Record<
          string,
          {
            productId: string
            productName: string
            size: string | null
            acquisitionType: AcquisitionType
            prices: Array<{
              id: string
              minQuantity: number
              maxQuantity: number | null
              price: number
              createdAt: Date
              updatedAt: Date
            }>
          }
        >
      )

      return {
        data: Object.values(groupedPrices),
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
      return { code }
    }
  }

  getAllProductServicePrices = async (productId: string) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      // First, get the product to know its acquisition type
      const product = await this.productRepository.findOne({
        where: { id: productId }
      })

      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Get all services with their default prices
      const allServices = await this.serviceRepository.find({
        relations: ['prices'],
        order: { id: 'ASC' }
      })

      // Filter services by product's acquisition type
      // Only include services where service.acquisitionType matches product.acquisitionType or is 'both'
      const filteredServices = allServices.filter((service) => {
        if (!service.acquisitionType) {
          return false
        }
        // If service has 'both', include it for any product acquisition type
        if (service.acquisitionType === ServiceAcquisitionType.BOTH) {
          return true
        }
        // Otherwise, only include if service acquisition type matches product acquisition type
        // Convert product acquisition type to service acquisition type for comparison
        const productAcquisitionTypeAsService =
          product.acquisitionType === AcquisitionType.BUY
            ? ServiceAcquisitionType.BUY
            : ServiceAcquisitionType.RENT
        return service.acquisitionType === productAcquisitionTypeAsService
      })

      // Get product-specific service prices
      const productServicePrices =
        await this.productServicePriceRepository.find({
          where: { productId },
          relations: ['service'],
          order: { serviceId: 'ASC', minQuantity: 'ASC' }
        })

      // Create a map of product service prices by serviceId
      const productServicePricesMap = new Map<string, ProductServicePrice[]>()
      productServicePrices.forEach((price) => {
        if (!productServicePricesMap.has(price.serviceId)) {
          productServicePricesMap.set(price.serviceId, [])
        }
        productServicePricesMap.get(price.serviceId)!.push(price)
      })

      // Determine which acquisition type to use based on product
      const relevantAcquisitionType =
        product.acquisitionType === AcquisitionType.BUY
          ? ServiceAcquisitionType.BUY
          : ServiceAcquisitionType.RENT

      // Build result: use product service prices if available, otherwise use default service prices
      const result = filteredServices.map((service) => {
        const productServicePricesForService = productServicePricesMap.get(
          service.id
        )

        // If product has custom prices for this service, use those
        if (
          productServicePricesForService &&
          productServicePricesForService.length > 0
        ) {
          return {
            serviceId: service.id,
            serviceName: service.name || '',
            prices: productServicePricesForService.map((price) => ({
              id: price.id,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price,
              createdAt: price.createdAt,
              updatedAt: price.updatedAt
            }))
          }
        }

        // Otherwise, use default service prices filtered by product's acquisition type
        const allDefaultPrices = service.prices || []
        const defaultPrices = allDefaultPrices
          .filter((p) => p.acquisitionType === relevantAcquisitionType)
          .sort((a, b) => a.minQuantity - b.minQuantity)

        return {
          serviceId: service.id,
          serviceName: service.name || '',
          prices: defaultPrices.map((price) => ({
            id: price.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price,
            createdAt: price.createdAt,
            updatedAt: price.updatedAt
          }))
        }
      })

      return {
        data: result,
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
      return { code }
    }
  }
}
