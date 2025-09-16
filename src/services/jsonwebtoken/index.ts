import { sign, SignOptions, verify } from 'jsonwebtoken'
import config from '../../config'

export enum KeyType {
  ACCESS_TOKEN_PRIVATE_KEY = 'ACCESS_TOKEN_PRIVATE_KEY',
  REFRESH_TOKEN_PRIVATE_KEY = 'REFRESH_TOKEN_PRIVATE_KEY',
  ACCESS_TOKEN_PUBLIC_KEY = 'ACCESS_TOKEN_PUBLIC_KEY',
  REFRESH_TOKEN_PUBLIC_KEY = 'REFRESH_TOKEN_PUBLIC_KEY'
}

export const generateToken = (
  payload: Object,
  key: KeyType.ACCESS_TOKEN_PRIVATE_KEY | KeyType.REFRESH_TOKEN_PRIVATE_KEY,
  options: SignOptions = {}
): string => {
  const privateKey = Buffer.from(config[key], 'base64').toString('ascii')

  const token = sign(payload, privateKey, {
    ...(options && options),
    algorithm: 'RS256'
  })

  return token
}

export const verifyToken = <T>(
  token: string,
  key: KeyType.ACCESS_TOKEN_PRIVATE_KEY | KeyType.REFRESH_TOKEN_PRIVATE_KEY
): T | undefined => {
  try {
    const publicKey = Buffer.from(config[key], 'base64').toString('ascii')

    return verify(token, publicKey) as T
  } catch (err) {
    return
  }
}
