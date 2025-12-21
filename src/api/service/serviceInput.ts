import { Request } from 'express'
import Joi from 'joi'
import {
  PriceCalculationUnit,
  AcquisitionType,
  BillingInterval,
  InputType
} from './serviceModel'

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
    .optional(),
  acquisitionType: Joi.string()
    .valid(AcquisitionType.BUY, AcquisitionType.RENT, AcquisitionType.BOTH)
    .allow(null)
    .optional(),
  billingInterval: Joi.string()
    .valid(
      BillingInterval.ONE_TIME,
      BillingInterval.WEEKLY,
      BillingInterval.MONTHLY
    )
    .allow(null)
    .optional(),
  isDefaultServiceForBuy: Joi.boolean().allow(null).optional(),
  isDefaultServiceForRent: Joi.boolean().allow(null).optional(),
  inputTypeForBuy: Joi.string()
    .valid(InputType.BEFORE, InputType.AFTER, InputType.BOTH)
    .allow(null)
    .optional(),
  inputTypeForRent: Joi.string()
    .valid(InputType.BEFORE, InputType.AFTER, InputType.BOTH)
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
        buyPrices: Joi.array().items(servicePriceTierSchema).optional(),
        rentPrices: Joi.array().items(servicePriceTierSchema).optional()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      description: req.body.description ?? null,
      priceCalculationUnit: req.body.priceCalculationUnit ?? null,
      acquisitionType: req.body.acquisitionType ?? null,
      billingInterval: req.body.billingInterval ?? null,
      isDefaultServiceForBuy: req.body.isDefaultServiceForBuy ?? null,
      isDefaultServiceForRent: req.body.isDefaultServiceForRent ?? null,
      inputTypeForBuy: req.body.inputTypeForBuy ?? null,
      inputTypeForRent: req.body.inputTypeForRent ?? null,
      buyPrices: Array.isArray(req.body.buyPrices)
        ? req.body.buyPrices
        : undefined,
      rentPrices: Array.isArray(req.body.rentPrices)
        ? req.body.rentPrices
        : undefined
    }
  }
}

export const updateServiceSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required(),
        ...baseServiceBody,
        buyPrices: Joi.array().items(servicePriceTierSchema).optional(),
        rentPrices: Joi.array().items(servicePriceTierSchema).optional()
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId,
      name: req.body.name,
      description: req.body.description ?? null,
      priceCalculationUnit: req.body.priceCalculationUnit ?? null,
      acquisitionType: req.body.acquisitionType ?? null,
      billingInterval: req.body.billingInterval ?? null,
      isDefaultServiceForBuy: req.body.isDefaultServiceForBuy ?? null,
      isDefaultServiceForRent: req.body.isDefaultServiceForRent ?? null,
      inputTypeForBuy: req.body.inputTypeForBuy ?? null,
      inputTypeForRent: req.body.inputTypeForRent ?? null,
      buyPrices: Array.isArray(req.body.buyPrices)
        ? req.body.buyPrices
        : undefined,
      rentPrices: Array.isArray(req.body.rentPrices)
        ? req.body.rentPrices
        : undefined
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

export const calculateServicePriceSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required(),
        productId: uuidSchema.required(),
        quantity: Joi.number().integer().min(1).required(),
        acquisitionType: Joi.string()
          .valid(AcquisitionType.BUY, AcquisitionType.RENT)
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId,
      productId: req.body.productId,
      quantity: req.body.quantity,
      acquisitionType: req.body.acquisitionType
    }
  }
}

export const calculateServicePriceForMultipleProductsSchema = (
  req: Request
) => {
  return {
    schema: Joi.object()
      .keys({
        serviceId: uuidSchema.required(),
        products: Joi.array()
          .items(
            Joi.object({
              productId: uuidSchema.required(),
              quantity: Joi.number().integer().min(1).required()
            })
          )
          .min(1)
          .required(),
        acquisitionType: Joi.string()
          .valid(AcquisitionType.BUY, AcquisitionType.RENT)
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      serviceId: req.params.serviceId,
      products: req.body.products,
      acquisitionType: req.body.acquisitionType
    }
  }
}
