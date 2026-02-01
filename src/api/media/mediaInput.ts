import { Request } from 'express'
import Joi from 'joi'

export const uploadMediaSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        type: Joi.string().valid('Image', 'Video', 'Audio', 'File').required()
      })
      .options({ abortEarly: false }),
    input: {
      type: req.query.type
    }
  }
}

export const deleteMediaSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        mediaId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      mediaId: req.body.mediaId
    }
  }
}

export const downloadMediaSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        mediaId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      mediaId: req.params.mediaId
    }
  }
}
