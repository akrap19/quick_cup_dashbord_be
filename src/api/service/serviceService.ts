import { Repository, In } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  IAllServicePrices,
  ICreateService,
  IDeleteService,
  IGetServiceById,
  IListServices,
  IServiceService,
  IServicesPagination,
  IUpdateService
} from './interface'
import { ServiceModel } from './serviceModel'
import { ServiceLocationModel } from '../service_location/serviceLocationModel'
import { ServicePrice } from './servicePriceModel'

type ListServicesResponse = Awaited<
  AsyncResponse<IServicesPagination<ServiceModel>>
>
type ServiceResponse = Awaited<AsyncResponse<ServiceModel>>
type DeleteResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ServicesService implements IServiceService<ServiceModel> {
  private readonly serviceRepository: Repository<ServiceModel>
  private readonly serviceLocationRepository: Repository<ServiceLocationModel>
  private readonly servicePriceRepository: Repository<ServicePrice>

  constructor() {
    this.serviceRepository = AppDataSource.manager.getRepository(ServiceModel)
    this.serviceLocationRepository =
      AppDataSource.manager.getRepository(ServiceLocationModel)
    this.servicePriceRepository =
      AppDataSource.manager.getRepository(ServicePrice)
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
      const servicesWithLocations = services.map((service) => ({
        ...service,
        locations: (() => {
          const cities = serviceLocations
            .filter((loc) => loc.serviceId === service.id)
            .map((loc) => loc?.city)
            .filter((city): city is string => Boolean(city))
          return cities.length > 0 ? cities.join(', ') : '-'
        })(),
        prices: service.prices
          ? [...service.prices].sort((a, b) => a.minQuantity - b.minQuantity)
          : []
      }))

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

      // Sort prices by minQuantity
      const sortedPrices = service.prices
        ? [...service.prices].sort((a, b) => a.minQuantity - b.minQuantity)
        : []

      const serviceWithPrices = {
        ...service,
        prices: sortedPrices
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
    prices,
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
        priceCalculationUnit: priceCalculationUnit ?? null
      })

      const savedService = await repository.save(service)

      // Validate and create prices if provided
      if (prices && prices.length > 0) {
        const validation = this.validatePriceTiers(prices)
        if (!validation.valid) {
          return { code: ResponseCode.BAD_REQUEST }
        }

        const servicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ServicePrice)
          : this.servicePriceRepository

        const priceRecords = prices.map((price) =>
          servicePriceRepository.create({
            serviceId: savedService.id,
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
            message: 'Failed to save service prices',
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

      // Sort prices by minQuantity
      const sortedPrices = serviceWithPrices.prices
        ? [...serviceWithPrices.prices].sort(
            (a, b) => a.minQuantity - b.minQuantity
          )
        : []

      const serviceResponse = {
        ...serviceWithPrices,
        prices: sortedPrices
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
    prices,
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

      if (Object.keys(updateData).length > 0) {
        await repository
          .createQueryBuilder()
          .update(ServiceModel)
          .set(updateData)
          .where('id = :serviceId', { serviceId })
          .execute()
      }

      // Handle price operations if specified
      if (prices !== undefined) {
        const servicePriceRepository = queryRunner
          ? queryRunner.manager.getRepository(ServicePrice)
          : this.servicePriceRepository

        // Validate prices if provided
        if (prices.length > 0) {
          const validation = this.validatePriceTiers(prices)
          if (!validation.valid) {
            return { code: ResponseCode.BAD_REQUEST }
          }
        }

        // Get existing prices
        const existingPrices = await servicePriceRepository.find({
          where: { serviceId },
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
          const deleteResult = await servicePriceRepository
            .createQueryBuilder()
            .delete()
            .from(ServicePrice)
            .where('id IN (:...priceIds)', { priceIds: priceIdsToRemove })
            .andWhere('service_id = :serviceId', { serviceId })
            .execute()

          logger.info({
            message: `Deleted service prices`,
            serviceId,
            deletedCount: deleteResult.affected || 0,
            priceIds: priceIdsToRemove
          })
        }

        if (pricesToAdd.length > 0) {
          const priceRecords = pricesToAdd.map((price) =>
            servicePriceRepository.create({
              serviceId,
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
              message: 'Failed to save service prices',
              stack: saveErr.stack
            })
            throw saveErr
          }
        }

        if (prices.length === 0 && existingPrices.length > 0) {
          const deleteResult = await servicePriceRepository
            .createQueryBuilder()
            .delete()
            .from(ServicePrice)
            .where('service_id = :serviceId', { serviceId })
            .execute()

          logger.info({
            message: `Removed all service prices`,
            serviceId,
            deletedCount: deleteResult.affected || 0
          })
        }
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

  getAllServicePrices = async (): AsyncResponse<IAllServicePrices[]> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const query = this.servicePriceRepository
        .createQueryBuilder('price')
        .leftJoinAndSelect('price.service', 'service')
        .orderBy('price.serviceId', 'ASC')
        .addOrderBy('price.minQuantity', 'ASC')

      const prices = await query.getMany()

      // Group by serviceId
      const groupedPrices = prices.reduce(
        (acc, price) => {
          if (!acc[price.serviceId]) {
            acc[price.serviceId] = {
              serviceId: price.serviceId,
              serviceName: price.service?.name || '',
              priceCalculationUnit: price.service?.priceCalculationUnit || null,
              prices: []
            }
          }
          acc[price.serviceId].prices.push({
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
            serviceId: string
            serviceName: string
            priceCalculationUnit: string | null
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
}
