import { QueryRunner } from 'typeorm'
import { AuthUser } from '../api/user/interface'
import { StatusCode, ResponseCode, ResponseMessage } from './response'
import fileUpload from 'express-fileupload'
import { getResponseMessage } from '../services/utils'
import { ApiKey } from '../api/auth/apiKeyModel'

type ResponseCodeRequired = { code: ResponseCode }

type DataType<T> = { [name: string]: T | ResponseCode | undefined }

export type AsyncResponse<T> = Promise<DataType<T> & ResponseCodeRequired>

export interface IServiceMethod {
  queryRunner?: QueryRunner
}

export type ResponseParams = {
  data?: object
  code: ResponseCode
  message?: ResponseMessage
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user: AuthUser
      apiKey: ApiKey;
      files?: fileUpload.FileArray | null | undefined
    }
  }
}

export class ResponseError extends Error {
  public code: ResponseCode

  constructor(responseCode: ResponseCode) {
    super(getResponseMessage(responseCode))
    this.code = responseCode
  }
}

export { StatusCode, ResponseCode, ResponseMessage }
