import { AsyncResponse, IServiceMethod } from '../../interface'
import { PriceCalculationUnit } from './serviceModel'

export interface ICreateService extends IServiceMethod {
  name: string
  description?: string | null
  priceCalculationUnit?: PriceCalculationUnit | null
  prices?: Array<{
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
  prices?: Array<{
    minQuantity: number
    maxQuantity?: number | null
    price: number
  }>
}

export interface IDeleteService extends IServiceMethod {
  serviceId: string
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
  prices: Array<{
    id: string
    minQuantity: number
    maxQuantity: number | null
    price: number
    createdAt: Date
    updatedAt: Date
  }>
}

export interface IGetAllServicePrices extends IServiceMethod {}

export interface IServiceService<T = unknown> {
  listServices(params: IListServices): AsyncResponse<IServicesPagination<T>>
  getServiceById(params: IGetServiceById): AsyncResponse<T>
  createService(params: ICreateService): AsyncResponse<T>
  updateService(params: IUpdateService): AsyncResponse<T>
  deleteService(params: IDeleteService): AsyncResponse<null>
  getAllServicePrices(): AsyncResponse<IAllServicePrices[]>
}
