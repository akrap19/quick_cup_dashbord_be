import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICreateService,
  IDeleteService,
  IGetServiceById,
  IListServices,
  IServiceService,
  IServicesPagination,
  IUpdateService
} from './interface'
import { ServiceModel } from './serviceModel'

type ListServicesResponse = Awaited<
  AsyncResponse<IServicesPagination<ServiceModel>>
>
type ServiceResponse = Awaited<AsyncResponse<ServiceModel>>
type DeleteResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ServicesService implements IServiceService<ServiceModel> {
  private readonly serviceRepository: Repository<ServiceModel>

  constructor() {
    this.serviceRepository = AppDataSource.manager.getRepository(ServiceModel)
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
        .orderBy('service.createdAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        services,
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

      const service = await repository.findOne({ where: { id: serviceId } })

      if (!service) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { service, code } as unknown as ServiceResponse
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
    queryRunner
  }: ICreateService): AsyncResponse<ServiceModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const service = repository.create({
        name,
        description: description ?? null
      })

      const savedService = await repository.save(service)

      return { service: savedService, code } as unknown as ServiceResponse
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
    queryRunner
  }: IUpdateService): AsyncResponse<ServiceModel> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const updateData: Partial<ServiceModel> = {}

      if (typeof name !== 'undefined') {
        updateData.name = name
      }

      if (typeof description !== 'undefined') {
        updateData.description = description ?? null
      }

      const repository = queryRunner
        ? queryRunner.manager.getRepository(ServiceModel)
        : this.serviceRepository

      const result = await repository
        .createQueryBuilder()
        .update(ServiceModel)
        .set(updateData)
        .where('id = :serviceId', { serviceId })
        .execute()

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const { service, code: getCode } = await this.getServiceById({
        serviceId,
        queryRunner
      })

      if (!service) {
        return { code: getCode }
      }

      return { service, code } as unknown as ServiceResponse
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
}
