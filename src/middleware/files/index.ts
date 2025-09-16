import {
  StatusCode,
  ResponseCode,
  ResponseMessage,
  ResponseParams
} from '../../interface'
import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import fs from 'fs'
import fileUpload from 'express-fileupload'

export const deleteTempFiles = async (
  prev: ResponseParams,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.files) {
      for (const file of Object.values(req.files)) {
        const media = file as fileUpload.UploadedFile

        if (media) {
          fs.unlink(media.tempFilePath, (err) => {
            if (err) console.error(`Failed to delete temp file: ${err.message}`)
          })
        }
      }
    }

    return next(prev)
  } catch (e: any) {
    return res.status(StatusCode.UNAUTHORIZED).send({
      data: null,
      code: ResponseCode.SERVER_ERROR,
      message: ResponseMessage.FAILED_INSERT
    })
  }
}
