import { AsyncResponse, IServiceMethod } from '../../interface'
import { RoleType } from '../role/interface'
import { UserRole } from '../user_role/userRoleModel'
import { LoginType } from '../user_session/interface'
import { User } from './userModel'

export type AuthUser = {
  id: string
  loginType: LoginType
  roles: UserRole[]
  authenticatedRoles: UserRole[]
}

export interface IUsersPagination {
  users: User[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export enum UserStatus {
  CREATED = 'Created',
  ACTIVE = 'Active',
  DELETED = 'Deleted'
}

export interface ICreateUser extends IServiceMethod {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

export interface IGetUserById extends IServiceMethod {
  userId: string
  allUsers?: boolean
  role?: RoleType
}

export interface IGetUserByEmail extends IServiceMethod {
  email: string
}

export interface IVerifyUser {
  userId: string
  password: string
}

export interface IEditUser extends IServiceMethod {
  userId: string
  email?: string
  newEmail?: string | null
  password?: string | null
  firstName?: string
  lastName?: string
  phoneNumber?: string | null
  status?: UserStatus
}

export interface IEditUserPassword {
  userId: string
  password: string
  newPassword: string
}

export interface ISaveNewUserEmail {
  user: User
  email: string
}

export interface IChangeUserEmail {
  userId: string
  email: string
}

export interface IDeleteUser extends IServiceMethod {
  userId: string
}

export interface IUserSettings {
  firstName: string
  lastName: string
  email: string
  newEmail: string | null
  phoneNumber: string | null
}

export interface IVerifyUserEmail {
  uid: string
  hashUid: string
}

export interface IGetUsers {
  search: string | null
  page: number
  limit: number
  role?: RoleType
  location?: string | null
}

export interface IUserService {
  createUser(params: ICreateUser): AsyncResponse<User>
  getUserById(params: IGetUserById): AsyncResponse<User>
  getUsers(params: IGetUsers): AsyncResponse<IUsersPagination>
  getUserByEmail(params: IGetUserByEmail): AsyncResponse<User>
  verifyUser(params: IVerifyUser): AsyncResponse<User>
  changeUserEmail(params: IChangeUserEmail): AsyncResponse<null>
  verifyUserEmail(params: IVerifyUserEmail): AsyncResponse<string>
  anonymizeUser(params: IDeleteUser): AsyncResponse<null>
  editUser(params: IEditUser): AsyncResponse<null>
  editUserPassword(params: IEditUserPassword): AsyncResponse<null>
}
