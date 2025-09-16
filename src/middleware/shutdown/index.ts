import { NextFunction, Request, Response } from 'express'
import { ResponseParams, ResponseCode, ResponseMessage } from '../../interface'

export const shutdownHandler = (shuttingDown: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (shuttingDown) {
      return next({
        code: ResponseCode.APP_SHUTTING_DOWN
      })
    }

    return next()
  }
}
