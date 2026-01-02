import { AsyncResponse } from '../../interface'
import { User } from '../user/userModel'

export interface IEditUser {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
  location: string
  productPrices?: Array<{
    productId: string
    prices: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  }>
  companyName?: string | null
  pin?: string | null
  street?: string | null
}

interface IUsersPagination {
  users: User[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IClientsLimited {
  userId: string
  name: string
  email: string
  phoneNumber: string | null
  status: string
  companyName: string | null
}

export interface IClientsPaginationLimited {
  users: IClientsLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateClient {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  location: string
  assignedById: string
  productPrices?: Array<{
    productId: string
    prices: Array<{
      minQuantity: number
      maxQuantity?: number | null
      price: number
    }>
  }>
  companyName?: string | null
  pin?: string | null
  street?: string | null
}

export interface IClientService {
  createClient(params: ICreateClient): AsyncResponse<null>
  editClient(params: IEditUser): AsyncResponse<User>
  deleteClient(params: { userId: string }): AsyncResponse<null>
  bulkDeleteClients(params: { userIds: string[] }): AsyncResponse<null>
}
