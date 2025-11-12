import { AsyncResponse, IServiceMethod } from '../../interface'
import { Product } from './productsModel'

export enum AcquisitionType {
  RENT = 'rent',
  BUY = 'buy'
}

export interface ICreateProduct extends IServiceMethod {
  name: string
  description?: string | null
  acquisitionType: AcquisitionType
}

export interface IUpdateProduct extends IServiceMethod {
  productId: string
  name?: string
  description?: string | null
  acquisitionType?: AcquisitionType
}

export interface IDeleteProduct extends IServiceMethod {
  productId: string
}

export interface IGetProductById extends IServiceMethod {
  productId: string
}

export interface IListProducts extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  acquisitionType?: AcquisitionType
}

export interface IProductsPagination {
  products: Product[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IProductService {
  listProducts(params: IListProducts): AsyncResponse<IProductsPagination>
  getProductById(params: IGetProductById): AsyncResponse<Product>
  createProduct(params: ICreateProduct): AsyncResponse<Product>
  updateProduct(params: IUpdateProduct): AsyncResponse<Product>
  deleteProduct(params: IDeleteProduct): AsyncResponse<null>
}
