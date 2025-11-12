import { AsyncResponse, IServiceMethod } from '../../interface'

export interface ICreateService extends IServiceMethod {
  name: string
  description?: string | null
}

export interface IUpdateService extends IServiceMethod {
  serviceId: string
  name?: string
  description?: string | null
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

export interface IServiceService<T = unknown> {
  listServices(params: IListServices): AsyncResponse<IServicesPagination<T>>
  getServiceById(params: IGetServiceById): AsyncResponse<T>
  createService(params: ICreateService): AsyncResponse<T>
  updateService(params: IUpdateService): AsyncResponse<T>
  deleteService(params: IDeleteService): AsyncResponse<null>
}
