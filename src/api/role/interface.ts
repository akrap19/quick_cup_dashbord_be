import { AsyncResponse, IServiceMethod } from '../../interface'
import { Role } from './roleModel'

export enum RoleType {
  MASTER_ADMIN = 'MasterAdmin',
  ADMIN = 'Admin',
  SERVICE = 'Service',
  CLIENT = 'Client'
}

export enum RoleName {
  MASTER_ADMIN = 'Master Admin',
  ADMIN = 'Admin',
  SERVICE = 'Service',
  CLIENT = 'Client'
}

export interface IGetRole extends IServiceMethod {
  roleName: RoleType
}

export interface IRoleService {
  getRole(params: IGetRole): AsyncResponse<Role>
}
