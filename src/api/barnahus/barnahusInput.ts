import { Request } from 'express'
import Joi from 'joi'

export const createBarnahusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        name: Joi.string().min(1).max(36).required(),
        location: Joi.string().min(6).max(127).required(),
        userId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .allow(null)
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      location: req.body.location,
      userId: req.body.userId
    }
  }
}

export const getBarnahusesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().min(1).allow(null).optional(),
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).required()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    }
  }
}

export const getBarnahusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        barnahusId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      barnahusId: req.params.id
    }
  }
}

export const editBarnahusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        barnahusId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        name: Joi.string().min(1).max(36).required(),
        location: Joi.string().min(1).max(127).required(),
        adminId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      barnahusId: req.body.barnahusId,
      name: req.body.name,
      location: req.body.location,
      adminId: req.body.adminId
    }
  }
}

export const deleteBarnahusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        barnahusId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      barnahusId: req.body.barnahusId
    }
  }
}

export const bulkDeleteBarnahusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        barnahusIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      barnahusIds: req.body.barnahusIds
    }
  }
}

export const searchBarnahusLocationsSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().max(32).allow('').optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search
    }
  }
}

export const getBarnahusTranslationsSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        barnahusId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      barnahusId: req.params.id
    }
  }
}
