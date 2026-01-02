import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICreateProductState,
  IDeleteProductState,
  IGetProductStateById,
  IListProductStates,
  IProductStateService,
  IProductStatesPagination,
  IUpdateProductState,
  ProductStateLocation
} from './interface'
import { ProductState } from './productStateModel'
import { ServiceModel } from '../service/serviceModel'
import { User } from '../user/userModel'

type ListProductStatesResponse = Awaited<
  AsyncResponse<IProductStatesPagination>
>
type ProductStateResponse = Awaited<AsyncResponse<ProductState>>
type DeleteProductStateResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ProductStateService implements IProductStateService {
  private readonly productStateRepository: Repository<ProductState>

  constructor() {
    this.productStateRepository =
      AppDataSource.manager.getRepository(ProductState)
  }

  listProductStates = async ({
    search,
    page = 1,
    limit = 25,
    status,
    location,
    productId,
    serviceId,
    userId,
    queryRunner
  }: IListProductStates): AsyncResponse<IProductStatesPagination> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(ProductState)
        : this.productStateRepository

      const query = repository
        .createQueryBuilder('productState')
        .leftJoinAndSelect('productState.product', 'product')
        .leftJoinAndSelect('productState.service', 'service')
        .leftJoinAndSelect('productState.user', 'user')

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere(
          '(LOWER(product.name) LIKE :searchLike OR LOWER(productState.status) LIKE :searchLike)',
          { searchLike }
        )
      }

      if (status) {
        query.andWhere('productState.status = :status', { status })
      }

      if (location) {
        query.andWhere('productState.location = :location', { location })
      }

      if (productId) {
        query.andWhere('productState.productId = :productId', { productId })
      }

      if (serviceId) {
        query.andWhere('productState.serviceId = :serviceId', { serviceId })
      }

      if (userId) {
        query.andWhere('productState.userId = :userId', { userId })
      }

      const offset = (currentPage - 1) * currentLimit

      const [productStates, count] = await query
        .orderBy('productState.createdAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        productStates,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListProductStatesResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListProductStatesResponse
  }

  getProductStateById = async ({
    productStateId,
    queryRunner
  }: IGetProductStateById): AsyncResponse<ProductState> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ProductState)
        : this.productStateRepository

      const productState = await repository.findOne({
        where: { id: productStateId },
        relations: ['product', 'service', 'user']
      })

      if (!productState) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { productState, code } as unknown as ProductStateResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductStateResponse
  }

  createProductState = async ({
    status,
    location,
    quantity,
    productId,
    serviceId,
    userId,
    queryRunner
  }: ICreateProductState): AsyncResponse<ProductState> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      // Normalize empty strings to null
      const normalizedServiceId =
        serviceId && typeof serviceId === 'string' && serviceId.trim() !== ''
          ? serviceId
          : null
      const normalizedUserId =
        userId && typeof userId === 'string' && userId.trim() !== ''
          ? userId
          : null

      // Validate location-specific fields
      if (location === ProductStateLocation.SERVICE && !normalizedServiceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.USER && !normalizedUserId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.SERVICE && normalizedUserId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.USER && normalizedServiceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }

      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      // Validate that referenced entities exist
      if (location === ProductStateLocation.SERVICE && normalizedServiceId) {
        const serviceRepository = manager.getRepository(ServiceModel)
        const service = await serviceRepository.findOne({
          where: { id: normalizedServiceId }
        })
        if (!service) {
          return { code: ResponseCode.INVALID_INPUT }
        }
      }

      if (location === ProductStateLocation.USER && normalizedUserId) {
        const userRepository = manager.getRepository(User)
        const user = await userRepository.findOne({
          where: { id: normalizedUserId }
        })
        if (!user) {
          return { code: ResponseCode.INVALID_INPUT }
        }
      }

      const repository = manager.getRepository(ProductState)

      const productState = repository.create({
        status,
        location,
        quantity,
        productId,
        serviceId:
          location === ProductStateLocation.SERVICE
            ? normalizedServiceId
            : null,
        userId: location === ProductStateLocation.USER ? normalizedUserId : null
      })

      const savedProductState = await repository.save(productState)

      // Reload with relations
      const productStateWithRelations = await repository.findOne({
        where: { id: savedProductState.id },
        relations: ['product', 'service', 'user']
      })

      if (!productStateWithRelations) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return {
        productState: productStateWithRelations,
        code
      } as unknown as ProductStateResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductStateResponse
  }

  updateProductState = async ({
    productStateId,
    status,
    location,
    quantity,
    productId,
    serviceId,
    userId,
    queryRunner
  }: IUpdateProductState): AsyncResponse<ProductState> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const repository = manager.getRepository(ProductState)

      const existingProductState = await repository.findOne({
        where: { id: productStateId }
      })

      if (!existingProductState) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Normalize empty strings to null
      const normalizedServiceId =
        serviceId && typeof serviceId === 'string' && serviceId.trim() !== ''
          ? serviceId
          : null
      const normalizedUserId =
        userId && typeof userId === 'string' && userId.trim() !== ''
          ? userId
          : null

      // Determine the location to use (new or existing)
      const finalLocation = location ?? existingProductState.location

      // Validate location-specific fields
      if (finalLocation === ProductStateLocation.SERVICE && normalizedUserId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (finalLocation === ProductStateLocation.USER && normalizedServiceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (
        finalLocation === ProductStateLocation.SERVICE &&
        !normalizedServiceId &&
        !existingProductState.serviceId
      ) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (
        finalLocation === ProductStateLocation.USER &&
        !normalizedUserId &&
        !existingProductState.userId
      ) {
        return { code: ResponseCode.INVALID_INPUT }
      }

      // Validate that referenced entities exist
      const finalServiceId =
        normalizedServiceId ?? existingProductState.serviceId
      if (finalLocation === ProductStateLocation.SERVICE && finalServiceId) {
        const serviceRepository = manager.getRepository(ServiceModel)
        const service = await serviceRepository.findOne({
          where: { id: finalServiceId }
        })
        if (!service) {
          return { code: ResponseCode.INVALID_INPUT }
        }
      }

      const finalUserId = normalizedUserId ?? existingProductState.userId
      if (finalLocation === ProductStateLocation.USER && finalUserId) {
        const userRepository = manager.getRepository(User)
        const user = await userRepository.findOne({
          where: { id: finalUserId }
        })
        if (!user) {
          return { code: ResponseCode.INVALID_INPUT }
        }
      }

      const updateData: Partial<ProductState> = {}

      if (typeof status !== 'undefined') {
        updateData.status = status
      }
      if (typeof location !== 'undefined') {
        updateData.location = location
      }
      if (typeof quantity !== 'undefined') {
        updateData.quantity = quantity
      }
      if (typeof productId !== 'undefined') {
        updateData.productId = productId
      }

      // Update location-specific fields
      if (finalLocation === ProductStateLocation.SERVICE) {
        updateData.serviceId = finalServiceId ?? null
        updateData.userId = null
      } else if (finalLocation === ProductStateLocation.USER) {
        updateData.userId = finalUserId ?? null
        updateData.serviceId = null
      }

      if (Object.keys(updateData).length > 0) {
        await repository
          .createQueryBuilder()
          .update(ProductState)
          .set(updateData)
          .where('id = :productStateId', { productStateId })
          .execute()
      }

      const updatedProductState = await repository.findOne({
        where: { id: productStateId },
        relations: ['product', 'service', 'user']
      })

      if (!updatedProductState) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return {
        productState: updatedProductState,
        code
      } as unknown as ProductStateResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ProductStateResponse
  }

  deleteProductState = async ({
    productStateId,
    queryRunner
  }: IDeleteProductState): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(ProductState)
        : this.productStateRepository

      const result = await repository.delete({ id: productStateId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteProductStateResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteProductStateResponse
  }
}
