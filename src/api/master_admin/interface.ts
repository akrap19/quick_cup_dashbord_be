import { AsyncResponse } from '../../interface'
import { User } from '../user/userModel'

export interface IMasterAdminsLimited {
  userId: string
  name: string
  phoneNumber?: string | null
}

export interface IMasterAdminsPaginationLimited {
  users: IMasterAdminsLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IEditMasterAdmin {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export interface IUsersLimited {
  userId: string
  name: string
  location: string | null
}

export interface IUsersPaginationLimited {
  users: IUsersLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateMasterAdmin {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  assignedById: string
}

export interface IMasterAdminService {
  createMasterAdmin(params: ICreateMasterAdmin): AsyncResponse<null>
  editMasterAdmin(params: IEditMasterAdmin): AsyncResponse<User>
}
