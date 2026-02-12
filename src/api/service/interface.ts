import { AsyncResponse, IServiceMethod } from '../../interface'
import {
  PriceCalculationUnit,
  AcquisitionType,
  BillingInterval,
  InputType
} from './serviceModel'

export interface ICreateService extends IServiceMethod {
  name: string
  description?: string | null
  priceCalculationUnit?: PriceCalculationUnit | null
  acquisitionType?: AcquisitionType | null
  billingInterval?: BillingInterval | null
  isDefaultServiceForBuy?: boolean | null
  isDefaultServiceForRent?: boolean | null
  inputTypeForBuy?: InputType | null
  inputTypeForRent?: InputType | null
  buyPrices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
  rentPrices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
}

export interface IUpdateService extends IServiceMethod {
  serviceId: string
  name?: string
  description?: string | null
  priceCalculationUnit?: PriceCalculationUnit | null
  acquisitionType?: AcquisitionType | null
  billingInterval?: BillingInterval | null
  isDefaultServiceForBuy?: boolean | null
  isDefaultServiceForRent?: boolean | null
  inputTypeForBuy?: InputType | null
  inputTypeForRent?: InputType | null
  buyPrices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
  rentPrices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
}

export interface IDeleteService extends IServiceMethod {
  serviceId: string
}

export interface IBulkDeleteServices extends IServiceMethod {
  serviceIds: string[]
}

export interface IGetServiceById extends IServiceMethod {
  serviceId: string
}

export interface IListServices extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
}

export interface IServicesPagination<T = unknown> {
  services: T[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IAllServicePrices {
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

export interface IGetAllServicePrices extends IServiceMethod {
  acquisitionType?: AcquisitionType.BUY | AcquisitionType.RENT
}

export interface ICalculateServicePrice extends IServiceMethod {
  serviceId: string
  productId: string
  quantity: number
  acquisitionType?: AcquisitionType.BUY | AcquisitionType.RENT
}

export interface ICalculateServicePriceResponse {
  serviceId: string
  productId: string
  quantity: number
  calculatedQuantity: number
  priceCalculationUnit: PriceCalculationUnit | null
  unitPrice: number
  totalPrice: number
  priceTier: {
    minQuantity: number
    maxQuantity: number | null
    price: number
  }
}

export interface ICalculateServicePriceForMultipleProducts
  extends IServiceMethod {
  serviceId: string
  products: Array<{
    productId: string
    quantity: number
  }>
  acquisitionType?: AcquisitionType.BUY | AcquisitionType.RENT
}

export interface ICalculateServicePriceForMultipleProductsResponse {
  serviceId: string
  products: Array<{
    productId: string
    quantity: number
    calculatedQuantity: number
  }>
  combinedCalculatedQuantity: number
  priceCalculationUnit: PriceCalculationUnit | null
  unitPrice: number
  totalPrice: number
  priceTier: {
    minQuantity: number
    maxQuantity: number | null
    price: number
  }
}

export interface IGetAllServiceLocations extends IServiceMethod {}

export interface IServiceLocationItem {
  id: string
  name: string
}

export interface IServiceService<T = unknown> {
  listServices(params: IListServices): AsyncResponse<IServicesPagination<T>>
  getServiceById(params: IGetServiceById): AsyncResponse<T>
  createService(params: ICreateService): AsyncResponse<T>
  updateService(params: IUpdateService): AsyncResponse<T>
  deleteService(params: IDeleteService): AsyncResponse<null>
  bulkDeleteServices(params: IBulkDeleteServices): AsyncResponse<null>
  getAllServicePrices(
    params?: IGetAllServicePrices
  ): AsyncResponse<IAllServicePrices[]>
  calculateServicePrice(
    params: ICalculateServicePrice
  ): AsyncResponse<ICalculateServicePriceResponse>
  calculateServicePriceForMultipleProducts(
    params: ICalculateServicePriceForMultipleProducts
  ): AsyncResponse<ICalculateServicePriceForMultipleProductsResponse>
  getAllServiceLocations(
    params?: IGetAllServiceLocations
  ): AsyncResponse<IServiceLocationItem[]>
}
