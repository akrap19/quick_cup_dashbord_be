import { AsyncResponse } from '../../interface'
import { User } from '../user/userModel'

export interface IEditUser {
  userId: string
  firstName: string
  lastName: string
  phoneNumber: string
  userProfession?: string
  barnahusId: string
}

interface IUsersPagination {
  users: User[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IPractitionersLimited {
  userId: string
  name: string
  userProfession: string
}

export interface IPractitionersPaginationLimited {
  users: IPractitionersLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreatePractitioner {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  barnahusId: string
  userProfession: string
  assignedById: string
}

export interface IPractitionerService {
  createPractitioner(params: ICreatePractitioner): AsyncResponse<null>
  editPractitioner(params: IEditUser): AsyncResponse<User>
}
