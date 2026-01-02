import { Repository, In } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  IAllServicePrices,
  ICalculateServicePrice,
  ICalculateServicePriceResponse,
  ICalculateServicePriceForMultipleProducts,
  ICalculateServicePriceForMultipleProductsResponse,
  ICreateService,
  IDeleteService,
  IGetAllServicePrices,
  IGetAllServiceLocations,
  IGetServiceById,
  IListServices,
  IServiceLocationItem,
  IServiceService,
  IServicesPagination,
  IUpdateService
} from './interface'
import { ServiceModel, PriceCalculationUnit } from './serviceModel'
import { AcquisitionType } from './acquisitionType'
import { ServiceLocationModel } from '../service_location/serviceLocationModel'
import { ServicePrice } from './servicePriceModel'
import { Product } from '../products/productsModel'
import { ProductServicePrice } from '../products/productServicePriceModel'
import { ProductStatus } from '../products/interface'

type ListServicesResponse = Awaited<
  AsyncResponse<IServicesPagination<ServiceModel>>
>
type ServiceResponse = Awaited<AsyncResponse<ServiceModel>>
type DeleteResponse = Awaited<AsyncResponse<null>>
type CalculateServicePriceResponse = Awaited<
  AsyncResponse<ICalculateServicePriceResponse>
>
type CalculateServicePriceForMultipleProductsResponse = Awaited<
  AsyncResponse<ICalculateServicePriceForMultipleProductsResponse>
>

@autoInjectable()
export class ServicesService implements IServiceService<ServiceModel> {
  private readonly serviceRepository: Repository<ServiceModel>
  private readonly serviceLocationRepository: Repository<ServiceLocationModel>
  private readonly servicePriceRepository: Repository<ServicePrice>
  private readonly productRepository: Repository<Product>
  private readonly productServicePriceRepository: Repository<ProductServicePrice>

  constructor() {
    this.serviceRepository = AppDataSource.manager.getRepository(ServiceModel)
    this.serviceLocationRepository =
      AppDataSource.manager.getRepository(ServiceLocationModel)
    this.servicePriceRepository =
      AppDataSource.manager.getRepository(ServicePrice)
    this.productRepository = AppDataSource.manager.getRepository(Product)
    this.productServicePriceRepository =
      AppDataSource.manager.getRepository(ProductServicePrice)
  }

  private calculateQuantityForProduct(
    quantity: number,
    product: Product,
    priceCalculationUnit: PriceCalculationUnit | null
  ): number {
    if (!priceCalculationUnit) {
      // If no priceCalculationUnit is set, default to piece
      return quantity
    }

    switch (priceCalculationUnit) {
      case PriceCalculationUnit.PIECE:
        // One product is one piece
        return quantity

      case PriceCalculationUnit.UNIT:
        // Divide total products by quantityPerUnit to get units
        if (!product.quantityPerUnit || product.quantityPerUnit === 0) {
          throw new Error(
            'Product quantityPerUnit is required for unit calculation'
          )
        }
        return quantity / product.quantityPerUnit

      case PriceCalculationUnit.TRANSPORTATION_UNIT:
        // First calculate units, then divide by unitsPerTransportationUnit
        if (!product.quantityPerUnit || product.quantityPerUnit === 0) {
          throw new Error(
            'Product quantityPerUnit is required for transportationUnit calculation'
          )
        }
        if (
          !product.unitsPerTransportationUnit ||
          product.unitsPerTransportationUnit === 0
        ) {
          throw new Error(
            'Product unitsPerTransportationUnit is required for transportationUnit calculation'
          )
        }
        const units = quantity / product.quantityPerUnit
        const transportationUnits = units / product.unitsPerTransportationUnit
        // If over 1, round up (ceiling)
        return transportationUnits > 1
          ? Math.ceil(transportationUnits)
          : transportationUnits

      default:
        return quantity
    }
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

  listServices = async ({
    search,
    page = 1,
    limit = 25,
    queryRunner
  }: IListServices): AsyncResponse<IServicesPagination<ServiceModel>> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const query = repository.createQueryBuilder('service')

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere(
          '(LOWER(service.name) LIKE :searchLike OR LOWER(service.description) LIKE :searchLike)',
          { searchLike }
        )
      }

      const offset = (currentPage - 1) * currentLimit

      const [services, count] = await query
        .leftJoinAndSelect('service.prices', 'prices')
        .orderBy('service.createdAt', 'DESC')
        .addOrderBy('prices.minQuantity', 'ASC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      // Fetch service locations for all services
      const serviceIds = services.map((service) => service.id)
      let serviceLocations: ServiceLocationModel[] = []

      if (serviceIds.length > 0) {
        const locationRepository = queryRunner
          ? queryRunner.manager.getRepository(ServiceLocationModel)
          : this.serviceLocationRepository

        serviceLocations = await locationRepository.find({
          where: { serviceId: In(serviceIds) },
          order: { createdAt: 'DESC' }
        })
      }

      // Group service locations by serviceId and attach to services
      const servicesWithLocations = services.map((service) => {
        const allPrices = service.prices || []
        const buyPrices = allPrices
          .filter((p) => p.acquisitionType === AcquisitionType.BUY)
          .sort((a, b) => a.minQuantity - b.minQuantity)
        const rentPrices = allPrices
          .filter((p) => p.acquisitionType === AcquisitionType.RENT)
          .sort((a, b) => a.minQuantity - b.minQuantity)

        return {
          ...service,
          locations: (() => {
            const cities = serviceLocations
              .filter((loc) => loc.serviceId === service.id)
              .map((loc) => loc?.city)
              .filter((city): city is string => Boolean(city))
            return cities.length > 0 ? cities.join(', ') : '-'
          })(),
          buyPrices,
          rentPrices
        }
      })

      const response = {
        services: servicesWithLocations,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListServicesResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListServicesResponse
  }

  getServiceById = async ({
    serviceId,
    queryRunner
  }: IGetServiceById): AsyncResponse<ServiceModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const service = await repository.findOne({
        where: { id: serviceId },
        relations: ['prices']
      })

      if (!service) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Separate prices by acquisition type and sort
      const allPrices = service.prices || []
      const buyPrices = allPrices
        .filter((p) => p.acquisitionType === AcquisitionType.BUY)
        .sort((a, b) => a.minQuantity - b.minQuantity)
      const rentPrices = allPrices
        .filter((p) => p.acquisitionType === AcquisitionType.RENT)
        .sort((a, b) => a.minQuantity - b.minQuantity)

      const serviceWithPrices = {
        ...service,
        buyPrices,
        rentPrices
      }

      return { service: serviceWithPrices, code } as unknown as ServiceResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ServiceResponse
  }

  createService = async ({
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
    rentPrices,
    queryRunner
  }: ICreateService): AsyncResponse<ServiceModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const service = repository.create({
        name,
        description: description ?? null,
        priceCalculationUnit: priceCalculationUnit ?? null,
        acquisitionType: acquisitionType ?? null,
        billingInterval: billingInterval ?? null,
        isDefaultServiceForBuy: isDefaultServiceForBuy ?? null,
        isDefaultServiceForRent: isDefaultServiceForRent ?? null,
        inputTypeForBuy: inputTypeForBuy ?? null,
        inputTypeForRent: inputTypeForRent ?? null
      })

      const savedService = await repository.save(service)

      // Validate and create buy prices if provided
      if (buyPrices && buyPrices.length > 0) {
        const validation = this.validatePriceTiers(buyPrices)
        if (!validation.valid) {
          return { code: ResponseCode.BAD_REQUEST }
        }

        const servicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ServicePrice)
          : this.servicePriceRepository

        const buyPriceRecords = buyPrices.map((price) =>
          servicePriceRepository.create({
            serviceId: savedService.id,
            acquisitionType: AcquisitionType.BUY,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price
          })
        )

        try {
          await servicePriceRepository.save(buyPriceRecords)
        } catch (saveErr: any) {
          logger.error({
            code: ResponseCode.SERVER_ERROR,
            message: 'Failed to save buy prices',
            stack: saveErr.stack
          })
          throw saveErr
        }
      }

      // Validate and create rent prices if provided
      if (rentPrices && rentPrices.length > 0) {
        const validation = this.validatePriceTiers(rentPrices)
        if (!validation.valid) {
          return { code: ResponseCode.BAD_REQUEST }
        }

        const servicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ServicePrice)
          : this.servicePriceRepository

        const rentPriceRecords = rentPrices.map((price) =>
          servicePriceRepository.create({
            serviceId: savedService.id,
            acquisitionType: AcquisitionType.RENT,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price
          })
        )

        try {
          await servicePriceRepository.save(rentPriceRecords)
        } catch (saveErr: any) {
          logger.error({
            code: ResponseCode.SERVER_ERROR,
            message: 'Failed to save rent prices',
            stack: saveErr.stack
          })
          throw saveErr
        }
      }

      // Reload service with prices
      const serviceWithPrices = await repository.findOne({
        where: { id: savedService.id },
        relations: ['prices']
      })

      if (!serviceWithPrices) {
        return { service: savedService, code } as unknown as ServiceResponse
      }

      // Separate prices by acquisition type and sort
      const allPrices = serviceWithPrices.prices || []
      const filteredBuyPrices = allPrices
        .filter((p) => p.acquisitionType === AcquisitionType.BUY)
        .sort((a, b) => a.minQuantity - b.minQuantity)
      const filteredRentPrices = allPrices
        .filter((p) => p.acquisitionType === AcquisitionType.RENT)
        .sort((a, b) => a.minQuantity - b.minQuantity)

      const serviceResponse = {
        ...serviceWithPrices,
        buyPrices: filteredBuyPrices,
        rentPrices: filteredRentPrices
      }

      return { service: serviceResponse, code } as unknown as ServiceResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ServiceResponse
  }

  updateService = async ({
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
    rentPrices,
    queryRunner
  }: IUpdateService): AsyncResponse<ServiceModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      // Verify service exists
      const service = await repository.findOne({ where: { id: serviceId } })
      if (!service) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const updateData: Partial<ServiceModel> = {}

      if (typeof name !== 'undefined') {
        updateData.name = name
      }

      if (typeof description !== 'undefined') {
        updateData.description = description ?? null
      }

      if (typeof priceCalculationUnit !== 'undefined') {
        updateData.priceCalculationUnit = priceCalculationUnit ?? null
      }

      if (typeof acquisitionType !== 'undefined') {
        updateData.acquisitionType = acquisitionType ?? null
      }

      if (typeof billingInterval !== 'undefined') {
        updateData.billingInterval = billingInterval ?? null
      }

      if (typeof isDefaultServiceForBuy !== 'undefined') {
        updateData.isDefaultServiceForBuy = isDefaultServiceForBuy ?? null
      }

      if (typeof isDefaultServiceForRent !== 'undefined') {
        updateData.isDefaultServiceForRent = isDefaultServiceForRent ?? null
      }

      if (typeof inputTypeForBuy !== 'undefined') {
        updateData.inputTypeForBuy = inputTypeForBuy ?? null
      }

      if (typeof inputTypeForRent !== 'undefined') {
        updateData.inputTypeForRent = inputTypeForRent ?? null
      }

      if (Object.keys(updateData).length > 0) {
        await repository
          .createQueryBuilder()
          .update(ServiceModel)
          .set(updateData)
          .where('id = :serviceId', { serviceId })
          .execute()
      }

      // Helper function to update prices for a specific acquisition type
      const updatePricesForType = async (
        providedPrices:
          | Array<{
              minQuantity: number
              maxQuantity?: number | null
              price: number
            }>
          | undefined,
        acquisitionType: AcquisitionType
      ) => {
        if (providedPrices === undefined) {
          return // Skip if not provided
        }

        const servicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ServicePrice)
          : this.servicePriceRepository

        // Validate prices if provided
        if (providedPrices.length > 0) {
          const validation = this.validatePriceTiers(providedPrices)
          if (!validation.valid) {
            throw new Error(`Invalid price tiers for ${acquisitionType}`)
          }
        }

        // Get existing prices for this acquisition type
        const existingPrices = await servicePriceRepository.find({
          where: { serviceId, acquisitionType },
          order: { minQuantity: 'ASC' }
        })

        // Helper function to check if two prices match
        const pricesMatch = (
          existing: ServicePrice,
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
            !providedPrices.some((provided) => pricesMatch(existing, provided))
        )

        // Find prices to add (provided prices that don't match any existing price)
        const pricesToAdd = providedPrices.filter(
          (provided) =>
            !existingPrices.some((existing) => pricesMatch(existing, provided))
        )

        // Remove prices that don't match
        if (pricesToRemove.length > 0) {
          const priceIdsToRemove = pricesToRemove.map((p) => p.id)
          const deleteResult = await servicePriceRepository
            .createQueryBuilder()
            .delete()
            .from(ServicePrice)
            .where('id IN (:...priceIds)', { priceIds: priceIdsToRemove })
            .andWhere('service_id = :serviceId', { serviceId })
            .andWhere('acquisition_type = :acquisitionType', {
              acquisitionType
            })
            .execute()

          logger.info({
            message: `Deleted ${acquisitionType} service prices`,
            serviceId,
            deletedCount: deleteResult.affected || 0,
            priceIds: priceIdsToRemove
          })
        }

        if (pricesToAdd.length > 0) {
          const priceRecords = pricesToAdd.map((price) =>
            servicePriceRepository.create({
              serviceId,
              acquisitionType,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity ?? null,
              price: price.price
            })
          )

          try {
            await servicePriceRepository.save(priceRecords)
          } catch (saveErr: any) {
            logger.error({
              code: ResponseCode.SERVER_ERROR,
              message: `Failed to save ${acquisitionType} prices`,
              stack: saveErr.stack
            })
            throw saveErr
          }
        }

        // If empty array is provided, remove all prices for this type
        if (
          providedPrices.length === 0 &&
          existingPrices.length > 0 &&
          providedPrices !== undefined
        ) {
          const deleteResult = await servicePriceRepository
            .createQueryBuilder()
            .delete()
            .from(ServicePrice)
            .where('service_id = :serviceId', { serviceId })
            .andWhere('acquisition_type = :acquisitionType', {
              acquisitionType
            })
            .execute()

          logger.info({
            message: `Removed all ${acquisitionType} service prices`,
            serviceId,
            deletedCount: deleteResult.affected || 0
          })
        }
      }

      // Handle buy prices if specified
      try {
        await updatePricesForType(buyPrices, AcquisitionType.BUY)
      } catch (err: any) {
        if (err.message?.includes('Invalid price tiers')) {
          return { code: ResponseCode.BAD_REQUEST }
        }
        throw err
      }

      // Handle rent prices if specified
      try {
        await updatePricesForType(rentPrices, AcquisitionType.RENT)
      } catch (err: any) {
        if (err.message?.includes('Invalid price tiers')) {
          return { code: ResponseCode.BAD_REQUEST }
        }
        throw err
      }

      // Reload service with prices
      const { service: updatedService, code: getCode } =
        await this.getServiceById({
          serviceId,
          queryRunner
        })

      if (!updatedService) {
        return { code: getCode }
      }

      return { service: updatedService, code } as unknown as ServiceResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ServiceResponse
  }

  deleteService = async ({
    serviceId,
    queryRunner
  }: IDeleteService): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const result = await repository.delete({ id: serviceId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteResponse
  }

  getAllServicePrices = async ({
    acquisitionType
  }: IGetAllServicePrices = {}): AsyncResponse<IAllServicePrices[]> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const query = this.servicePriceRepository
        .createQueryBuilder('price')
        .leftJoinAndSelect('price.service', 'service')
        .orderBy('price.serviceId', 'ASC')
        .addOrderBy('price.acquisitionType', 'ASC')
        .addOrderBy('price.minQuantity', 'ASC')

      // Filter by acquisition type if provided
      if (acquisitionType) {
        // Filter by price acquisition type, and also include services where service.acquisitionType is 'both'
        query.andWhere(
          '(price.acquisitionType = :acquisitionType) AND (service.acquisitionType = :acquisitionType OR service.acquisitionType = :both)',
          {
            acquisitionType,
            both: AcquisitionType.BOTH
          }
        )
      }

      const prices = await query.getMany()

      // Group by serviceId and separate by acquisition type
      const groupedPrices = prices.reduce(
        (acc, price) => {
          if (!acc[price.serviceId]) {
            acc[price.serviceId] = {
              serviceId: price.serviceId,
              serviceName: price.service?.name || '',
              priceCalculationUnit: price.service?.priceCalculationUnit || null,
              buyPrices: [],
              rentPrices: []
            }
          }
          const priceData = {
            id: price.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity ?? null,
            price: price.price,
            createdAt: price.createdAt,
            updatedAt: price.updatedAt
          }
          if (price.acquisitionType === AcquisitionType.BUY) {
            acc[price.serviceId].buyPrices.push(priceData)
          } else if (price.acquisitionType === AcquisitionType.RENT) {
            acc[price.serviceId].rentPrices.push(priceData)
          }
          return acc
        },
        {} as Record<
          string,
          {
            serviceId: string
            serviceName: string
            priceCalculationUnit: string | null
            buyPrices: Array<{
              id: string
              minQuantity: number
              maxQuantity: number | null
              price: number
              createdAt: Date
              updatedAt: Date
            }>
            rentPrices: Array<{
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

  calculateServicePrice = async ({
    serviceId,
    productId,
    quantity,
    acquisitionType,
    queryRunner
  }: ICalculateServicePrice): AsyncResponse<ICalculateServicePriceResponse> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const serviceRepository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const productRepository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const servicePriceRepository = queryRunner
        ? queryRunner.manager.getRepository(ServicePrice)
        : this.servicePriceRepository

      // Get service
      const service = await serviceRepository.findOne({
        where: { id: serviceId }
      })

      if (!service) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Get product (excluding deleted)
      const product = await productRepository.findOne({
        where: { id: productId, status: ProductStatus.ACTIVE }
      })

      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Determine acquisition type (use product's acquisitionType if not provided)
      const finalAcquisitionType =
        acquisitionType || product.acquisitionType || AcquisitionType.BUY

      // Calculate effective quantity based on priceCalculationUnit
      let calculatedQuantity: number
      try {
        calculatedQuantity = this.calculateQuantityForProduct(
          quantity,
          product,
          service.priceCalculationUnit || null
        )
      } catch (err: any) {
        return { code: ResponseCode.BAD_REQUEST }
      }

      // Store original calculated quantity for response
      const originalCalculatedQuantity = calculatedQuantity

      // Round up for tier matching (price tiers use integer quantities)
      const quantityForTierMatching = Math.max(1, Math.ceil(calculatedQuantity))

      // First, try to find product-specific service prices
      const productServicePriceRepository = queryRunner
        ? queryRunner.manager.getRepository(ProductServicePrice)
        : this.productServicePriceRepository

      const productServicePrices = await productServicePriceRepository.find({
        where: {
          productId,
          serviceId
        },
        order: { minQuantity: 'ASC' }
      })

      let selectedPrice: ServicePrice | ProductServicePrice | null = null
      let prices: (ServicePrice | ProductServicePrice)[] = []

      // Use product-specific prices if available, otherwise use general service prices
      if (productServicePrices.length > 0) {
        prices = productServicePrices
      } else {
        const servicePrices = await servicePriceRepository.find({
          where: {
            serviceId,
            acquisitionType: finalAcquisitionType
          },
          order: { minQuantity: 'ASC' }
        })
        prices = servicePrices
      }

      if (prices.length === 0) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Find the price tier that matches the calculated quantity
      for (const price of prices) {
        if (quantityForTierMatching >= price.minQuantity) {
          if (
            price.maxQuantity === null ||
            price.maxQuantity === undefined ||
            quantityForTierMatching <= price.maxQuantity
          ) {
            selectedPrice = price
          }
        }
      }

      // If no exact match, use the highest tier (last one)
      if (!selectedPrice) {
        selectedPrice = prices[prices.length - 1]
      }

      if (!selectedPrice) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const unitPrice = Number(selectedPrice.price)
      const calculatedTotalPrice = unitPrice * originalCalculatedQuantity
      // Round totalPrice up to the nearest multiple of unitPrice
      const totalPrice = Math.ceil(calculatedTotalPrice / unitPrice) * unitPrice

      const response = {
        serviceId,
        productId,
        quantity,
        calculatedQuantity: originalCalculatedQuantity,
        priceCalculationUnit: service.priceCalculationUnit || null,
        unitPrice,
        totalPrice,
        priceTier: {
          minQuantity: selectedPrice.minQuantity,
          maxQuantity: selectedPrice.maxQuantity ?? null,
          price: unitPrice
        }
      } as ICalculateServicePriceResponse

      return { data: response, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as CalculateServicePriceResponse
  }

  calculateServicePriceForMultipleProducts = async ({
    serviceId,
    products,
    acquisitionType,
    queryRunner
  }: ICalculateServicePriceForMultipleProducts): AsyncResponse<ICalculateServicePriceForMultipleProductsResponse> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const serviceRepository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const productRepository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const servicePriceRepository = queryRunner
        ? queryRunner.manager.getRepository(ServicePrice)
        : this.servicePriceRepository

      // Get service
      const service = await serviceRepository.findOne({
        where: { id: serviceId }
      })

      if (!service) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Get all products (excluding deleted)
      const productIds = products.map((p) => p.productId)
      const fetchedProducts = await productRepository.find({
        where: { id: In(productIds), status: ProductStatus.ACTIVE }
      })

      if (fetchedProducts.length !== productIds.length) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Create a map for quick lookup
      const productMap = new Map(fetchedProducts.map((p) => [p.id, p]))

      // Determine acquisition type (use first product's acquisitionType if not provided)
      const firstProduct = fetchedProducts[0]
      const finalAcquisitionType =
        acquisitionType || firstProduct.acquisitionType || AcquisitionType.BUY

      // Calculate calculatedQuantity for each product and combine them
      const productCalculations: Array<{
        productId: string
        quantity: number
        calculatedQuantity: number
      }> = []

      let combinedCalculatedQuantity = 0

      for (const productInput of products) {
        const product = productMap.get(productInput.productId)
        if (!product) {
          return { code: ResponseCode.NOT_FOUND }
        }

        let calculatedQuantity: number
        try {
          calculatedQuantity = this.calculateQuantityForProduct(
            productInput.quantity,
            product,
            service.priceCalculationUnit || null
          )
        } catch (err: any) {
          return { code: ResponseCode.BAD_REQUEST }
        }

        productCalculations.push({
          productId: productInput.productId,
          quantity: productInput.quantity,
          calculatedQuantity
        })

        combinedCalculatedQuantity += calculatedQuantity
      }

      // Round up for tier matching (price tiers use integer quantities)
      const quantityForTierMatching = Math.max(
        1,
        Math.ceil(combinedCalculatedQuantity)
      )

      // Check for product-specific service prices (check all products, use first one found)
      const productServicePriceRepository = queryRunner
        ? queryRunner.manager.getRepository(ProductServicePrice)
        : this.productServicePriceRepository

      let selectedPrice: ServicePrice | ProductServicePrice | null = null
      let prices: (ServicePrice | ProductServicePrice)[] = []

      // Check all products for ProductServicePrice, use the first one found
      let productServicePrices: ProductServicePrice[] = []
      for (const productInput of products) {
        const foundPrices = await productServicePriceRepository.find({
          where: {
            productId: productInput.productId,
            serviceId
          },
          order: { minQuantity: 'ASC' }
        })
        if (foundPrices.length > 0) {
          productServicePrices = foundPrices
          break
        }
      }

      // Use product-specific prices if available, otherwise use general service prices
      if (productServicePrices.length > 0) {
        prices = productServicePrices
      } else {
        const servicePrices = await servicePriceRepository.find({
          where: {
            serviceId,
            acquisitionType: finalAcquisitionType
          },
          order: { minQuantity: 'ASC' }
        })
        prices = servicePrices
      }

      if (prices.length === 0) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Find the price tier that matches the combined calculated quantity
      for (const price of prices) {
        if (quantityForTierMatching >= price.minQuantity) {
          if (
            price.maxQuantity === null ||
            price.maxQuantity === undefined ||
            quantityForTierMatching <= price.maxQuantity
          ) {
            selectedPrice = price
          }
        }
      }

      // If no exact match, use the highest tier (last one)
      if (!selectedPrice) {
        selectedPrice = prices[prices.length - 1]
      }

      if (!selectedPrice) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const unitPrice = Number(selectedPrice.price)
      const calculatedTotalPrice = unitPrice * combinedCalculatedQuantity
      // Round totalPrice up to the nearest multiple of unitPrice
      const totalPrice = Math.ceil(calculatedTotalPrice / unitPrice) * unitPrice

      const response = {
        serviceId,
        products: productCalculations,
        combinedCalculatedQuantity,
        priceCalculationUnit: service.priceCalculationUnit || null,
        unitPrice,
        totalPrice,
        priceTier: {
          minQuantity: selectedPrice.minQuantity,
          maxQuantity: selectedPrice.maxQuantity ?? null,
          price: unitPrice
        }
      } as ICalculateServicePriceForMultipleProductsResponse

      return { data: response, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return {
      code
    } as unknown as CalculateServicePriceForMultipleProductsResponse
  }

  getAllServiceLocations = async ({
    queryRunner
  }: IGetAllServiceLocations = {}): AsyncResponse<IServiceLocationItem[]> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceLocationModel)
        : this.serviceLocationRepository

      const serviceLocations = await repository.find({
        relations: ['service'],
        order: { createdAt: 'DESC' }
      })

      const formattedLocations: IServiceLocationItem[] = serviceLocations.map(
        (location) => {
          const serviceName = location.service?.name || 'Unknown Service'
          const locationName = location.city || 'Unknown Location'
          return {
            id: location.id,
            name: `${serviceName} - ${locationName}`
          }
        }
      )

      return { data: formattedLocations, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as AsyncResponse<IServiceLocationItem[]>
  }
}
