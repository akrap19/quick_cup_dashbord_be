import { Request } from 'express'
import Joi from 'joi'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

export const listServiceLocationsSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit
  const rawServiceId = req.query.serviceId

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        serviceId: uuidSchema.optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: Array.isArray(rawSearch)
        ? rawSearch[0]
        : rawSearch === undefined
        ? null
        : rawSearch,
      page: Array.isArray(rawPage) ? rawPage[0] : rawPage,
      limit: Array.isArray(rawLimit) ? rawLimit[0] : rawLimit,
      serviceId: Array.isArray(rawServiceId)
        ? rawServiceId[0]
        : rawServiceId === undefined
        ? undefined
        : rawServiceId
    }
  }
}

export const createServiceLocationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        city: Joi.string().min(1).max(255).required(),
        address: Joi.string().min(1).max(255).required(),
        phone: Joi.string()
          .regex(
            /^(|([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9]){3,24})$/
          )
          .allow(null)
          .optional(),
        email: Joi.string().min(6).max(255).trim().email().required(),
        serviceId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      city: req.body.city,
      address: req.body.address,
      phone: req.body.phone ?? null,
      email: req.body.email,
      serviceId: req.body.serviceId
    }
  }
}

export const updateServiceLocationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceLocationId: uuidSchema.required(),
        city: Joi.string().min(1).max(255).optional(),
        address: Joi.string().min(1).max(255).optional(),
        phone: Joi.string()
          .regex(
            /^(|([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9]){3,24})$/
          )
          .allow(null)
          .optional(),
        email: Joi.string().min(6).max(255).trim().email().optional(),
        serviceId: uuidSchema.optional()
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      serviceLocationId: req.params.serviceLocationId,
      city: req.body.city,
      address: req.body.address,
      phone: req.body.phone ?? null,
      email: req.body.email,
      serviceId: req.body.serviceId
    }
  }
}

export const serviceLocationIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceLocationId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      serviceLocationId: req.params.serviceLocationId
    }
  }
}
