import { Request } from 'express'
import Joi from 'joi'

export const addMasterAdminSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        email: Joi.string().min(6).max(255).trim().email().required(),
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
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber
    }
  }
}

export const getMasterAdminsSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().min(1).allow(null).optional(),
        location: Joi.string().min(1).allow(null).optional(),
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).required()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search,
      location: req.query.location,
      page: req.query.page,
      limit: req.query.limit
    }
  }
}

export const getMasterAdminSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        userId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      userId: req.params.id
    }
  }
}

export const deleteMasterAdminSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        userId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      userId: req.body.userId
    }
  }
}

export const bulkDeleteMasterAdminSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        userIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      userIds: req.body.userIds
    }
  }
}

export const editMasterAdminSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        userId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
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
      userId: req.body.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber
    }
  }
}
