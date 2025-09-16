import { AsyncResponse } from '../../interface'
import { ApiKey } from './apiKeyModel'
import { Case } from '../case/caseModel'
import { RoleType } from '../role/interface'
import { User } from '../user/userModel'
import { UserRole } from '../user_role/userRoleModel'
import { LoginType } from '../user_session/interface'

export interface IUserRole {
  userRoleId: string
  name: string
  barnahuses: {
    barnahusId: string
    name: string
    location: string
  }[]
}
export interface ICheckUserSpecificRole {
  userId: string
  roles: RoleType[]
}

export interface IUserRoleBarnahus {
  barnahusId: string
  name: string
  location: string
  userRoles: {
    userRoleId: string
    name: string
  }[]
}

export interface IGetUserRoleListResponse {
  userRoles: IUserRole[]
  barnahusRoles: IUserRoleBarnahus[]
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

export interface IAuthenticateCasePassword {
  customId: string
  password: string
}

export interface IChangeCasePassword {
  caseId: string
  password: string
  newPassword: string
}

export interface IGetApiKey {
  key: string
}

export interface IAuthService {
  verifyUser(params: IVerifyUser): AsyncResponse<User>
  authenticatePassword(params: ICheckCredentials): AsyncResponse<User>
  signToken(params: ISignToken): AsyncResponse<TokenResponse>
  refreshToken(params: IRefreshToken): AsyncResponse<IRefreshTokenResponse>
  logout(params: ILogout): AsyncResponse<boolean>
  getUserRoleList(
    params: IGetUserRoleList
  ): AsyncResponse<IGetUserRoleListResponse>
  sendForgotPasswordEmail(params: ISendForgotPasswordEmail): AsyncResponse<null>
  resetPassword(params: IResetPassword): AsyncResponse<string>
  checkIfSpecificRole(params: ICheckUserSpecificRole): AsyncResponse<UserRole[]>
  authenticateCasePassword(
    params: IAuthenticateCasePassword
  ): AsyncResponse<Case>
  getApiKey(params: IGetApiKey): AsyncResponse<ApiKey>
}
