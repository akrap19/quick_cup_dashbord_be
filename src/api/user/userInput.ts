import { Request } from 'express'
import Joi from 'joi'

export const userPersonalSettingsSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        firstName: Joi.string().min(1).max(36).required(),
        lastName: Joi.string().min(1).max(36).required(),
        phoneNumber: Joi.string()
          .regex(
            /^(|([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9]){3,24})$/
          )
          .allow(null)
      })
      .options({ abortEarly: false }),
    input: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber
    }
  }
}

export const userPasswordSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        oldPassword: Joi.string().min(8).max(24).required(),
        newPassword: Joi.string().min(8).max(24).required()
      })
      .options({ abortEarly: false }),
    input: {
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword
    }
  }
}

export const userEmailSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        email: Joi.string().min(6).max(255).trim().email().required()
      })
      .options({ abortEarly: false }),
    input: {
      email: req.body.email
    }
  }
}

export const validateEmailSchema = (req: Request) => {
  console.log('matijaaaaaaa', req.query.uid, req.query.hashUid)
  return {
    schema: Joi.object()
      .keys({
        uid: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        hashUid: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      uid: req.query.uid,
      hashUid: req.query.hashUid
    }
  }
}
