import { AsyncResponse } from '../../interface'
import { UserSession } from './userSessionModel'

export enum UserSessionStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  LOGGED_OUT = 'LoggedOut'
}

export enum LoginType {
  WEB = 'web'
}

export interface IStoreUserSession {
  userId: string
  refreshToken: string
  loginType: LoginType
}

export interface IUpdateUserSession {
  userId: string
  refreshToken: string
}

export interface IExpireUserSession {
  userId: string
  status: UserSessionStatus.EXPIRED | UserSessionStatus.LOGGED_OUT
}

export interface IGetLoginType {
  userId: string
}

export interface IUserSessionService {
  storeUserSession(params: IStoreUserSession): AsyncResponse<UserSession>
  updateUserSession(params: IUpdateUserSession): AsyncResponse<UserSession>
  expireUserSession(params: IExpireUserSession): AsyncResponse<null>
  getLoginType(params: IGetLoginType): AsyncResponse<LoginType[]>
}
