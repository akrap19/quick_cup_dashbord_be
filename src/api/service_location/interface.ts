import { AsyncResponse, IServiceMethod } from '../../interface'
import { ServiceLocationModel } from './serviceLocationModel'
import { User } from '../user/userModel'

export interface ICreateServiceLocation extends IServiceMethod {
  city: string
  address: string
  phone?: string | null
  email: string
  serviceId: string
  assignedById: string
}

export interface IUpdateServiceLocation extends IServiceMethod {
  serviceLocationId: string
  city?: string
  address?: string
  phone?: string | null
  email?: string
  serviceId?: string
}

export interface IDeleteServiceLocation extends IServiceMethod {
  serviceLocationId: string
}

export interface IGetServiceLocationById extends IServiceMethod {
  serviceLocationId: string
}

export interface IListServiceLocations extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  serviceId?: string
}

export interface IServiceLocationsPagination<T = unknown> {
  serviceLocations: T[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IServiceLocationService<T = unknown> {
  listServiceLocations(
    params: IListServiceLocations
  ): AsyncResponse<IServiceLocationsPagination<T>>
  getServiceLocationById(params: IGetServiceLocationById): AsyncResponse<T>
  createServiceLocation(params: ICreateServiceLocation): AsyncResponse<T>
  updateServiceLocation(params: IUpdateServiceLocation): AsyncResponse<T>
  deleteServiceLocation(params: IDeleteServiceLocation): AsyncResponse<null>
}

export interface IServiceLocationLimited {
  serviceLocationId: string
  city: string
  address: string
  phone?: string | null
  email: string
  userId: string
  serviceId: string
}
