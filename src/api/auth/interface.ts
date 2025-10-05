import { AsyncResponse } from '../../interface'
import { ApiKey } from './apiKeyModel'
import { RoleType } from '../role/interface'
import { User } from '../user/userModel'
import { UserRole } from '../user_role/userRoleModel'
import { LoginType } from '../user_session/interface'

export interface IUserRole {
  userRoleId: string
  name: string
}
export interface ICheckUserSpecificRole {
  userId: string
  roles: RoleType[]
}

export interface IGetUserRoleListResponse {
  userRoles: IUserRole[]
}

export interface IVerifyUser {
  uid: string
  hashUid: string
  password: string
}

export interface ICheckCredentials {
  email: string
  password: string
}

export interface ISignToken {
  sub: string
  loginType: LoginType
  accessTokenExpiresIn?: number
  refreshTokenExpiresIn?: number
}

interface TokenResponse {
  accessToken: string
  accessTokenExpiresAt: Date
  refreshToken: string
  refreshTokenExpiresAt: Date | null
}

export interface IRefreshToken {
  refreshToken: string
}

export interface ILogout {
  userId: string
}

export interface IGetUserRoleList {
  userId: string
}

export interface ISendForgotPasswordEmail {
  email: string
}

export interface IResetPassword {
  uid: string
  hashUid: string
  password: string
}

export interface IRefreshTokenResponse {
  tokens: TokenResponse
  user: User
}

export interface IGetApiKey {
  key: string
}

export interface IStoreUserSession {
  userId: string
  refreshToken: string
  loginType: LoginType
}

export interface IAuthService {
  verifyUser(params: IVerifyUser): AsyncResponse<User>
  authenticatePassword(params: ICheckCredentials): AsyncResponse<User>
  signToken(params: ISignToken): AsyncResponse<TokenResponse>
  storeUserSession(params: IStoreUserSession): AsyncResponse<null>
  refreshToken(params: IRefreshToken): AsyncResponse<IRefreshTokenResponse>
  logout(params: ILogout): AsyncResponse<boolean>
  getUserRoleList(
    params: IGetUserRoleList
  ): AsyncResponse<IGetUserRoleListResponse>
  sendForgotPasswordEmail(params: ISendForgotPasswordEmail): AsyncResponse<null>
  resetPassword(params: IResetPassword): AsyncResponse<string>
  checkIfSpecificRole(params: ICheckUserSpecificRole): AsyncResponse<UserRole[]>
  getApiKey(params: IGetApiKey): AsyncResponse<ApiKey>
}
