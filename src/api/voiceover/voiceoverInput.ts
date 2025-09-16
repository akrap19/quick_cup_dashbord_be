import { Request } from 'express'
import Joi from 'joi'

export const getVoiceoverSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        name: Joi.string().min(1).max(36).required(),
        language: Joi.string().min(1).max(36).required()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      language: req.body.language
    }
  }
}
