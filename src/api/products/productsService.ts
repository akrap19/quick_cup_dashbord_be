import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICreateProduct,
  IDeleteProduct,
  IGetProductById,
  IListProducts,
  IProductService,
  IProductsPagination,
  IUpdateProduct
} from './interface'
import { Product } from './productsModel'

type ListProductsResponse = Awaited<AsyncResponse<IProductsPagination>>
type ProductResponse = Awaited<AsyncResponse<Product>>
type DeleteProductResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class ProductsService implements IProductService {
  private readonly productRepository: Repository<Product>

  constructor() {
    this.productRepository = AppDataSource.manager.getRepository(Product)
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
        .orderBy('product.createdAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        products,
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

      const product = await repository.findOne({ where: { id: productId } })

      if (!product) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { product, code } as unknown as ProductResponse
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
    description,
    acquisitionType,
    queryRunner
  }: ICreateProduct): AsyncResponse<Product> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const product = repository.create({
        name,
        description: description ?? null,
        acquisitionType
      })

      const savedProduct = await repository.save(product)

      return { product: savedProduct, code } as unknown as ProductResponse
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
    description,
    acquisitionType,
    queryRunner
  }: IUpdateProduct): AsyncResponse<Product> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const updateData: Partial<Product> = {}

      if (typeof name !== 'undefined') {
        updateData.name = name
      }

      if (typeof acquisitionType !== 'undefined') {
        updateData.acquisitionType = acquisitionType
      }

      if (typeof description !== 'undefined') {
        updateData.description = description ?? null
      }

      const repository = queryRunner
        ? queryRunner.manager.getRepository(Product)
        : this.productRepository

      const result = await repository
        .createQueryBuilder()
        .update(Product)
        .set(updateData)
        .where('id = :productId', { productId })
        .execute()

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const { product, code: getCode } = await this.getProductById({
        productId,
        queryRunner
      })

      if (!product) {
        return { code: getCode }
      }

      return { product, code } as unknown as ProductResponse
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
}
