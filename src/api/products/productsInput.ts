import { Request } from 'express'
import Joi from 'joi'
import { AcquisitionType } from './interface'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const priceTierSchema = Joi.object({
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

const baseProductBody = {
  name: Joi.string().min(1).max(128),
  size: Joi.string().max(128).allow('', null).optional(),
  unit: Joi.string().max(128).allow('', null).optional(),
  quantityPerUnit: Joi.number().integer().min(0).optional(),
  transportationUnit: Joi.string().max(128).allow('', null).optional(),
  unitsPerTransportationUnit: Joi.number().integer().min(0).optional(),
  description: Joi.string().allow('', null),
  acquisitionType: Joi.string()
    .valid(AcquisitionType.BUY, AcquisitionType.RENT)
    .required()
}

export const listProductsSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit
  const rawAcquisitionType = req.query.acquisitionType

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        acquisitionType: Joi.string()
          .valid(AcquisitionType.BUY, AcquisitionType.RENT)
          .optional()
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
      acquisitionType: Array.isArray(rawAcquisitionType)
        ? rawAcquisitionType[0]
        : rawAcquisitionType === undefined
        ? undefined
        : rawAcquisitionType
    }
  }
}

export const createProductSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        ...baseProductBody,
        imageIds: Joi.array().items(uuidSchema).optional(),
        prices: Joi.array().items(priceTierSchema).optional(),
        servicePrices: Joi.array()
          .items(
            Joi.object({
              serviceId: uuidSchema.required(),
              prices: Joi.array().items(priceTierSchema).required()
            })
          )
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      size: req.body.size,
      unit: req.body.unit,
      quantityPerUnit: req.body.quantityPerUnit,
      transportationUnit: req.body.transportationUnit,
      unitsPerTransportationUnit: req.body.unitsPerTransportationUnit,
      description: req.body.description ?? null,
      acquisitionType: req.body.acquisitionType,
      imageIds: Array.isArray(req.body.imageIds)
        ? req.body.imageIds
        : undefined,
      prices: Array.isArray(req.body.prices) ? req.body.prices : undefined,
      servicePrices: Array.isArray(req.body.servicePrices)
        ? req.body.servicePrices
        : undefined
    }
  }
}

export const updateProductSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productId: uuidSchema.required(),
        ...baseProductBody,
        imageIdsToAdd: Joi.array().items(uuidSchema).optional(),
        imageIdsToRemove: Joi.array().items(uuidSchema).optional(),
        prices: Joi.array().items(priceTierSchema).optional(),
        servicePrices: Joi.array()
          .items(
            Joi.object({
              serviceId: uuidSchema.required(),
              prices: Joi.array().items(priceTierSchema).required()
            })
          )
          .optional()
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      productId: req.params.productId,
      name: req.body.name,
      size: req.body.size,
      unit: req.body.unit,
      quantityPerUnit: req.body.quantityPerUnit,
      transportationUnit: req.body.transportationUnit,
      unitsPerTransportationUnit: req.body.unitsPerTransportationUnit,
      description: req.body.description ?? null,
      acquisitionType: req.body.acquisitionType,
      imageIdsToAdd: Array.isArray(req.body.imageIdsToAdd)
        ? req.body.imageIdsToAdd
        : undefined,
      imageIdsToRemove: Array.isArray(req.body.imageIdsToRemove)
        ? req.body.imageIdsToRemove
        : undefined,
      prices: Array.isArray(req.body.prices) ? req.body.prices : undefined,
      servicePrices: Array.isArray(req.body.servicePrices)
        ? req.body.servicePrices
        : undefined
    }
  }
}

export const productIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      productId: req.params.productId
    }
  }
}

export const getAllProductPricesSchema = (req: Request) => {
  const rawAcquisitionType = req.query.acquisitionType

  return {
    schema: Joi.object()
      .keys({
        acquisitionType: Joi.string()
          .valid(AcquisitionType.BUY, AcquisitionType.RENT)
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      acquisitionType: Array.isArray(rawAcquisitionType)
        ? rawAcquisitionType[0]
        : rawAcquisitionType === undefined
        ? undefined
        : rawAcquisitionType
    }
  }
}

export const getAllProductServicePricesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      productId: req.params.productId
    }
  }
}
