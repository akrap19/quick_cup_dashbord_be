import { AsyncResponse, IServiceMethod } from '../../interface'
import { RoleType } from '../role/interface'
import { UserRole } from './userRoleModel'

export interface IAssignRole extends IServiceMethod {
  userId: string
  roleName: RoleType
  assignedById: string
  userProfession?: string
  barnahusId?: string
}

export interface ICreateUserRole {
  userId: string
  roleId: string
  assignedById: string
}

export interface IRevokeRole {
  userId: string
  roleId: string
}

export interface IGetUserRoles extends IServiceMethod {
  userId: string
}

export interface IGetUserSpecificRole extends IServiceMethod {
  userId: string
  roles: RoleType[]
}

export interface IGetUserRole extends IServiceMethod {
  userId: string
  role: RoleType
}

export interface IEditUserRole extends IServiceMethod {
  userRoleId: string
  userRoleBarnahusId: string
}

export interface IGetUserRoleBarnahusesByUserRole {
  role: RoleType
  barnahusId: string
}

export interface IGetUserRoleBarnahusesByUserId {
  userId: string
  barnahusId: string
}

export interface IAssignUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  barnahusId: string
}

export interface IDeleteUserRole extends IServiceMethod {
  userId: string
  role: RoleType
}

export interface IGetUserRoleBarnahus {
  userId: string
  role: RoleType
  barnahusId: string
}

export interface IDeleteUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  barnahusId: string
}

export interface IBulkDeleteUserRoles {
  userIds: string[]
  role: RoleType
}

export interface IUserRoleService {
  assignRole(params: IAssignRole): AsyncResponse<null>
  revokeRole(params: IRevokeRole): AsyncResponse<null>
  getUserRoles(params: IGetUserRoles): AsyncResponse<UserRole[]>
  getUserRole(params: IGetUserRole): AsyncResponse<UserRole>
  deleteUserRole(params: IDeleteUserRole): AsyncResponse<null>
  bulkDeleteUserRoles(params: IBulkDeleteUserRoles): AsyncResponse<null>
  getUserSpecificRoles(params: IGetUserSpecificRole): AsyncResponse<UserRole[]>
}
