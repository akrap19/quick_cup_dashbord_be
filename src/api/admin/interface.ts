import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { User } from '../user/userModel'

export interface IEditUser {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface IUsersLimited {
  userId: string
  name: string
}

export interface IUsersPaginationLimited {
  users: IUsersLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateAdmin {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  assignedById: string
}

export interface IAdminService {
  createAdmin(params: ICreateAdmin): AsyncResponse<null>
  editAdmin(params: IEditUser): AsyncResponse<User>
  deleteAdmin(params: { userId: string }): AsyncResponse<null>
  bulkDeleteAdmins(params: { userIds: string[] }): AsyncResponse<null>
}
