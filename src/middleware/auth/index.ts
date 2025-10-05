import {
  ResponseCode,
  ResponseError,
  ResponseMessage,
  StatusCode
} from '../../interface'
import { NextFunction, Request, Response } from 'express'
import { KeyType, verifyToken } from '../../services/jsonwebtoken'
import _ from 'lodash'
import { logger } from '../../logger'
import config from '../../config'
import { UserService } from '../../api/user/userService'
import { RoleType } from '../../api/role/interface'
import { container } from 'tsyringe'
import { LoginType } from '../../api/user_session/interface'
import { AuthService } from '../../api/auth/authService'

const authenticatedDocUsers: { [key: string]: string } = {
  [config.DOCS_USER]: config.DOCS_PASSWORD
}

export const requireToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = ''
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    const decodedToken = await verifyToken<any>(
      token,
      KeyType.ACCESS_TOKEN_PRIVATE_KEY
    )
    if (
      !decodedToken ||
      typeof decodedToken.payload === 'string' ||
      !decodedToken.sub
    ) {
      throw new ResponseError(ResponseCode.INVALID_TOKEN)
    }

    const { user } = await container.resolve(UserService).getUserById({
      userId: decodedToken.sub
    })

    if (!user) {
      throw new ResponseError(ResponseCode.INVALID_TOKEN)
    }

    req.user = {
      ...req.user,
      ...user,
      roles: user.userRoles,
      loginType: decodedToken.loginType
    }

    logger.defaultMeta = {
      ...logger.defaultMeta,
      user_id: user.id || 'null'
    }

    return next()
  } catch (e: any) {
    return next(e)
  }
}

export const requireLoginType =
  (loginTypes: LoginType[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req

      if (!loginTypes.includes(user.loginType)) {
        throw new ResponseError(ResponseCode.FORBIDDEN)
      }

      return next()
    } catch (e: any) {
      return next(e)
    }
  }

export const requireRole =
  (roleNames: RoleType[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req

      let userRoles = user.roles.filter((userRole) =>
        roleNames.includes(userRole.role.name as RoleType)
      )
      if (!userRoles) {
        throw new ResponseError(ResponseCode.FORBIDDEN)
      }

      req.user = {
        ...req.user,
        authenticatedRoles: userRoles
      }

      return next()
    } catch (e: any) {
      next(e)
    }
  }

export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.headers['x-api-key'] as string

    if (!key || typeof key != 'string') {
      return res.status(StatusCode.UNAUTHORIZED).send({
        data: null,
        code: ResponseCode.MISSING_API_KEY,
        message: ResponseMessage.MISSING_API_KEY
      })
    }

    const { apiKey, code } = await container
      .resolve(AuthService)
      .getApiKey({ key })

    if (!apiKey) {
      return res.status(StatusCode.UNAUTHORIZED).send({
        data: null,
        code,
        message: ResponseMessage.INVALID_API_KEY
      })
    }

    req.apiKey = apiKey

    return next()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return res.status(StatusCode.UNAUTHORIZED).send({
      data: null,
      code: ResponseCode.INVALID_API_KEY,
      message: ResponseMessage.INVALID_API_KEY
    })
  }
}

export const authenticateDocs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header('Authorization')

  if (authHeader) {
    const encodedCredentials = authHeader.split(' ')[1]
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64'
    ).toString()
    const [username, password] = decodedCredentials.split(':')

    if (authenticatedDocUsers[username] === password) {
      return next()
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Authentication Required"')
  res.status(401).send('Authentication required')
}
