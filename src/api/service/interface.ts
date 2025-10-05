import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { User } from '../user/userModel'

export interface IEditUser {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface IServicesLimited {
  userId: string
  name: string
}

export interface IServicesPaginationLimited {
  users: IServicesLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateService {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  assignedById: string
}

export interface IServiceService {
  createService(params: ICreateService): AsyncResponse<null>
  editService(params: IEditUser): AsyncResponse<User>
  deleteService(params: { userId: string }): AsyncResponse<null>
  bulkDeleteServices(params: { userIds: string[] }): AsyncResponse<null>
}
