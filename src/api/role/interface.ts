import { AsyncResponse, IServiceMethod } from '../../interface'
import { Role } from './roleModel'

export enum RoleType {
  SUPER_ADMIN = 'SuperAdmin',
  MASTER_ADMIN = 'MasterAdmin',
  ADMIN = 'Admin',
  PRACTITIONER = 'Practitioner'
}

export enum RoleName {
  SUPER_ADMIN = 'Super Admin',
  MASTER_ADMIN = 'Master Admin',
  ADMIN = 'Admin',
  PRACTITIONER = 'Practitioner'
}


export interface IGetRole extends IServiceMethod  {
  roleName: RoleType
}

export interface IRoleService {
  getRole(params: IGetRole): AsyncResponse<Role>
}
