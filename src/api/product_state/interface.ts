import { AsyncResponse, IServiceMethod } from '../../interface'
import { ProductState } from './productStateModel'

export enum ProductStateStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
  DAMAGED = 'damaged',
  OWNED_BY_CLIENT = 'owned_by_client'
}

export enum ProductStateLocation {
  SERVICE = 'service',
  USER = 'user'
}

export interface ICreateProductState extends IServiceMethod {
  status: ProductStateStatus
  location: ProductStateLocation
  quantity: number
  productId: string
  serviceId?: string | null
  userId?: string | null
}

export interface IUpdateProductState extends IServiceMethod {
  productStateId: string
  status?: ProductStateStatus
  location?: ProductStateLocation
  quantity?: number
  productId?: string
  serviceId?: string | null
  userId?: string | null
}

export interface IGetProductStateById extends IServiceMethod {
  productStateId: string
}

export interface IListProductStates extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  status?: ProductStateStatus | null
  location?: ProductStateLocation | null
  productId?: string | null
  serviceId?: string | null
  userId?: string | null
}

export interface IDeleteProductState extends IServiceMethod {
  productStateId: string
}

export interface IProductStatesPagination {
  productStates: ProductState[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IProductStateService {
  listProductStates(
    params: IListProductStates
  ): AsyncResponse<IProductStatesPagination>
  getProductStateById(params: IGetProductStateById): AsyncResponse<ProductState>
  createProductState(params: ICreateProductState): AsyncResponse<ProductState>
  updateProductState(params: IUpdateProductState): AsyncResponse<ProductState>
  deleteProductState(params: IDeleteProductState): AsyncResponse<null>
}
