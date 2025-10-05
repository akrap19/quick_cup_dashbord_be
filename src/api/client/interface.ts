import { AsyncResponse } from '../../interface'
import { User } from '../user/userModel'

export interface IEditUser {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
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
  assignedById: string
}

export interface IClientService {
  createClient(params: ICreateClient): AsyncResponse<null>
  editClient(params: IEditUser): AsyncResponse<User>
  deleteClient(params: { userId: string }): AsyncResponse<null>
  bulkDeleteClients(params: { userIds: string[] }): AsyncResponse<null>
}
