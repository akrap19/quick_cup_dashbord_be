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
      // Validate location-specific fields
      if (location === ProductStateLocation.SERVICE && !serviceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.USER && !userId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.SERVICE && userId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (location === ProductStateLocation.USER && serviceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }

      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const repository = manager.getRepository(ProductState)

      const productState = repository.create({
        status,
        location,
        quantity,
        productId,
        serviceId: location === ProductStateLocation.SERVICE ? serviceId : null,
        userId: location === ProductStateLocation.USER ? userId : null
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

      // Determine the location to use (new or existing)
      const finalLocation = location ?? existingProductState.location

      // Validate location-specific fields
      if (finalLocation === ProductStateLocation.SERVICE && userId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (finalLocation === ProductStateLocation.USER && serviceId) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (
        finalLocation === ProductStateLocation.SERVICE &&
        !serviceId &&
        !existingProductState.serviceId
      ) {
        return { code: ResponseCode.INVALID_INPUT }
      }
      if (
        finalLocation === ProductStateLocation.USER &&
        !userId &&
        !existingProductState.userId
      ) {
        return { code: ResponseCode.INVALID_INPUT }
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
        updateData.serviceId =
          serviceId ?? existingProductState.serviceId ?? null
        updateData.userId = null
      } else if (finalLocation === ProductStateLocation.USER) {
        updateData.userId = userId ?? existingProductState.userId ?? null
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
