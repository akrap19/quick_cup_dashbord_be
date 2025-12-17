import { Request } from 'express'
import Joi from 'joi'
import { PriceCalculationUnit } from './serviceModel'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const servicePriceTierSchema = Joi.object({
  minQuantity: Joi.number().integer().min(1).required(),
  maxQuantity: Joi.number()
    .integer()
    .min(Joi.ref('minQuantity'))
    .allow(null)
    .optional()
    .messages({
      'number.min': 'maxQuantity must be greater than or equal to minQuantity'
    }),
  price: Joi.number().positive().required()
})

const baseServiceBody = {
  name: Joi.string().min(1).max(128),
  description: Joi.string().allow('', null),
  priceCalculationUnit: Joi.string()
    .valid(
      PriceCalculationUnit.PIECE,
      PriceCalculationUnit.UNIT,
      PriceCalculationUnit.TRANSPORTATION_UNIT
    )
    .allow(null)
    .optional()
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
        name: baseServiceBody.name.required(),
        prices: Joi.array().items(servicePriceTierSchema).optional()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      description: req.body.description ?? null,
      priceCalculationUnit: req.body.priceCalculationUnit ?? null,
      prices: Array.isArray(req.body.prices) ? req.body.prices : undefined
    }
  }
}

export const updateServiceSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required(),
        ...baseServiceBody,
        prices: Joi.array().items(servicePriceTierSchema).optional()
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId,
      name: req.body.name,
      description: req.body.description ?? null,
      priceCalculationUnit: req.body.priceCalculationUnit ?? null,
      prices: Array.isArray(req.body.prices) ? req.body.prices : undefined
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

export const getAllServicePricesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({})
      .options({ abortEarly: false }),
    input: {}
  }
}
