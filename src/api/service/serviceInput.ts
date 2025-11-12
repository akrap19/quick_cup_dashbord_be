import { Request } from 'express'
import Joi from 'joi'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseServiceBody = {
  name: Joi.string().min(1).max(128),
  description: Joi.string().allow('', null)
}

export const listServicesSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: Array.isArray(rawSearch)
        ? rawSearch[0]
        : rawSearch === undefined
        ? null
        : rawSearch,
      page: Array.isArray(rawPage) ? rawPage[0] : rawPage,
      limit: Array.isArray(rawLimit) ? rawLimit[0] : rawLimit
    }
  }
}

export const createServiceSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        ...baseServiceBody,
        name: baseServiceBody.name.required()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      description: req.body.description ?? null
    }
  }
}

export const updateServiceSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required(),
        ...baseServiceBody
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId,
      name: req.body.name,
      description: req.body.description ?? null
    }
  }
}

export const serviceIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId
    }
  }
}
