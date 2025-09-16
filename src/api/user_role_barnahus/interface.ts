import { AsyncResponse, IServiceMethod } from '../../interface'
import { RoleType } from '../role/interface'
import { UserRole } from '../user_role/userRoleModel'
import { UserRoleBarnahus } from './userRoleBarnahusModel'

export interface IGetUserRoleBarnahusesByUserRole {
  role: RoleType
  barnahusId: string
}

export interface IGetUserRoleBarnahusesByUserId {
  userId: string
  barnahusId: string
}

export interface IEditUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  userRoleBarnahusId: string,
  userProfession?: string
}

export interface IAssignUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  barnahusId: string
  assignedById: string
  sendEmail?: boolean
  userProfession?: string
}

export interface IGetUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  barnahusId: string
}

export interface IGetUserRoleBarnahuses extends IServiceMethod {
  userId: string
  roles: RoleType[]
  barnahusId: string
}

export interface IGetUserBarnahusIdsByUserIdAndRole {
  userId: string
  roleName: RoleType[]
}

export interface IDeleteUserRoleBarnahus extends IServiceMethod {
  userId: string
  role: RoleType
  barnahusId: string
}

export interface IBulkDeleteUserRoleBarnahuses {
  userIds: string[]
  role: RoleType,
  barnahusId: string
}

export interface IUserRoleBarnahusService {
  assignUserRoleToBarnahus(params: IAssignUserRoleBarnahus): AsyncResponse<UserRole>
  getUserRoleBarnahus(
    params: IGetUserRoleBarnahus
  ): AsyncResponse<UserRoleBarnahus>
  getUserRoleBarnahuses(
    params: IGetUserRoleBarnahuses
  ): AsyncResponse<UserRoleBarnahus[]>
  editUserRoleBarnahus(params: IEditUserRoleBarnahus): AsyncResponse<null>
  getUserRoleBarnahusesByRole(
    params: IGetUserRoleBarnahusesByUserRole
  ): AsyncResponse<UserRoleBarnahus[]>
  getUserRoleBarnahusesByUserId(
    params: IGetUserRoleBarnahusesByUserId
  ): AsyncResponse<UserRoleBarnahus[]>
  deleteUserRoleBarnahus(params: IDeleteUserRoleBarnahus): AsyncResponse<null>
  bulkDeleteUserRoleBarnahuses(params: IBulkDeleteUserRoleBarnahuses): AsyncResponse<null>
  getUserRoleBarnahusesByUserRole(params: IGetUserBarnahusIdsByUserIdAndRole): AsyncResponse<UserRoleBarnahus[]>
}
