import { AsyncResponse, IServiceMethod } from '../../interface'
import { Product } from './productsModel'

export enum AcquisitionType {
  RENT = 'rent',
  BUY = 'buy'
}

export enum ProductStatus {
  ACTIVE = 'Active',
  DELETED = 'Deleted'
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
  designTemplateId?: string | null
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
  productStates?: Array<{
    status: string
    location: string
    quantity: number
    serviceLocationId?: string | null
    userId?: string | null
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
  designTemplateId?: string | null
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
  productStates?: Array<{
    status: string
    location: string
    quantity: number
    serviceLocationId?: string | null
    userId?: string | null
  }>
}

export interface IDeleteProduct extends IServiceMethod {
  productId: string
}

export interface IGetProductById extends IServiceMethod {
  productId: string
  userId?: string
  isClient?: boolean
}

export interface IListProducts extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  acquisitionType?: AcquisitionType
}

export interface IGetMyProducts extends IServiceMethod {
  userId: string
  page?: number
  limit?: number
  search?: string | null
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

export interface ICalculateProductPrice extends IServiceMethod {
  productId: string
  quantity: number
  userId: string
}

export interface ICalculatedProductPrice {
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  priceSource: 'client' | 'product'
}

export interface IBulkUpdateProductStates extends IServiceMethod {
  updates: Array<{
    productId: string
    productStates: Array<{
      status: string
      location: string
      quantity: number
      serviceLocationId?: string | null
      userId?: string | null
    }>
  }>
}

export interface IBulkUpdateProductStatesResult {
  updatedProducts: Array<{
    productId: string
    success: boolean
    product?: Product
    error?: string
  }>
}

export interface IProductService {
  listProducts(params: IListProducts): AsyncResponse<IProductsPagination>
  getProductById(params: IGetProductById): AsyncResponse<Product>
  getMyProducts(params: IGetMyProducts): AsyncResponse<IProductsPagination>
  createProduct(params: ICreateProduct): AsyncResponse<Product>
  updateProduct(params: IUpdateProduct): AsyncResponse<Product>
  deleteProduct(params: IDeleteProduct): AsyncResponse<null>
  getAllProductPrices(
    params: IGetAllProductPrices
  ): AsyncResponse<IAllProductPrices[]>
  getAllProductServicePrices(
    productId: string
  ): AsyncResponse<IAllProductServicePrices[]>
  calculateProductPrice(
    params: ICalculateProductPrice
  ): AsyncResponse<ICalculatedProductPrice>
  bulkUpdateProductStates(
    params: IBulkUpdateProductStates
  ): AsyncResponse<IBulkUpdateProductStatesResult>
  downloadDesignTemplate(params: {
    productId: string
  }): AsyncResponse<{ buffer: Buffer; fileName: string; mimeType: string }>
}
