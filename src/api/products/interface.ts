import { AsyncResponse, IServiceMethod } from '../../interface'
import { Product } from './productsModel'

export enum AcquisitionType {
  RENT = 'rent',
  BUY = 'buy'
}

export interface ICreateProduct extends IServiceMethod {
  name: string
  size?: string
  unit?: string
  quantityPerUnit?: number
  transportationUnit?: string
  unitsPerTransportationUnit?: number
  description?: string | null
  acquisitionType: AcquisitionType
  imageIds?: string[]
  prices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
  servicePrices?: Array<{
    serviceId: string
    prices: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  }>
}

export interface IUpdateProduct extends IServiceMethod {
  productId: string
  name?: string
  size?: string
  unit?: string
  quantityPerUnit?: number
  transportationUnit?: string
  unitsPerTransportationUnit?: number
  description?: string | null
  acquisitionType?: AcquisitionType
  imageIdsToAdd?: string[]
  imageIdsToRemove?: string[]
  prices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
  servicePrices?: Array<{
    serviceId: string
    prices: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  }>
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

export interface IAllProductPrices {
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

export interface IGetAllProductPrices extends IServiceMethod {
  acquisitionType?: AcquisitionType
}

export interface IAllProductServicePrices {
  serviceId: string
  serviceName: string
  prices: Array<{
    id: string
    minQuantity: number
    maxQuantity: number | null
    price: number
    createdAt: Date
    updatedAt: Date
  }>
}

export interface IGetAllProductServicePrices extends IServiceMethod {
  productId: string
}

export interface IProductService {
  listProducts(params: IListProducts): AsyncResponse<IProductsPagination>
  getProductById(params: IGetProductById): AsyncResponse<Product>
  createProduct(params: ICreateProduct): AsyncResponse<Product>
  updateProduct(params: IUpdateProduct): AsyncResponse<Product>
  deleteProduct(params: IDeleteProduct): AsyncResponse<null>
  getAllProductPrices(
    params: IGetAllProductPrices
  ): AsyncResponse<IAllProductPrices[]>
  getAllProductServicePrices(
    productId: string
  ): AsyncResponse<IAllProductServicePrices[]>
}
