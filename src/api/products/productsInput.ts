import { Request } from 'express'
import Joi from 'joi'
import { AcquisitionType } from './interface'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseProductBody = {
  name: Joi.string().min(1).max(128),
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
        ...baseProductBody
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      description: req.body.description ?? null,
      acquisitionType: req.body.acquisitionType
    }
  }
}

export const updateProductSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productId: uuidSchema.required(),
        ...baseProductBody
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      productId: req.params.productId,
      name: req.body.name,
      description: req.body.description ?? null,
      acquisitionType: req.body.acquisitionType
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
