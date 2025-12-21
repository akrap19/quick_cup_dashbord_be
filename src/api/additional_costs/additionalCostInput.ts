import { Request } from 'express'
import Joi from 'joi'
import { MethodOfPayment, BillingType } from './interface'
import { AcquisitionType } from '../products/interface'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseAdditionalCostBody = {
  name: Joi.string().min(1).max(255),
  methodOfPayment: Joi.string()
    .valid(MethodOfPayment.BEFORE, MethodOfPayment.AFTER)
    .optional(),
  billingType: Joi.string()
    .valid(BillingType.BY_PIECE, BillingType.ONE_TIME)
    .optional(),
  acquisitionType: Joi.string()
    .valid(AcquisitionType.BUY, AcquisitionType.RENT)
    .optional(),
  price: Joi.number().precision(4).positive()
}

export const listAdditionalCostsSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit
  const rawMethodOfPayment = req.query.methodOfPayment
  const rawBillingType = req.query.billingType
  const rawAcquisitionType = req.query.acquisitionType

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        methodOfPayment: Joi.string()
          .valid(MethodOfPayment.BEFORE, MethodOfPayment.AFTER)
          .allow('', null)
          .optional(),
        billingType: Joi.string()
          .valid(BillingType.BY_PIECE, BillingType.ONE_TIME)
          .allow('', null)
          .optional(),
        acquisitionType: Joi.string()
          .valid(AcquisitionType.BUY, AcquisitionType.RENT)
          .allow('', null)
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
      methodOfPayment: Array.isArray(rawMethodOfPayment)
        ? rawMethodOfPayment[0]
        : rawMethodOfPayment === undefined
        ? null
        : rawMethodOfPayment,
      billingType: Array.isArray(rawBillingType)
        ? rawBillingType[0]
        : rawBillingType === undefined
        ? null
        : rawBillingType,
      acquisitionType: Array.isArray(rawAcquisitionType)
        ? rawAcquisitionType[0]
        : rawAcquisitionType === undefined
        ? null
        : rawAcquisitionType
    }
  }
}

export const createAdditionalCostSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        ...baseAdditionalCostBody,
        name: baseAdditionalCostBody.name.required(),
        methodOfPayment: baseAdditionalCostBody.methodOfPayment.required(),
        billingType: baseAdditionalCostBody.billingType.required(),
        acquisitionType: baseAdditionalCostBody.acquisitionType.required(),
        price: baseAdditionalCostBody.price.required()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      methodOfPayment: req.body.methodOfPayment,
      billingType: req.body.billingType,
      acquisitionType: req.body.acquisitionType,
      price: req.body.price
    }
  }
}

export const updateAdditionalCostSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        additionalCostId: uuidSchema.required(),
        ...baseAdditionalCostBody
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      additionalCostId: req.params.additionalCostId,
      name: req.body.name,
      methodOfPayment: req.body.methodOfPayment,
      billingType: req.body.billingType,
      acquisitionType: req.body.acquisitionType,
      price: req.body.price
    }
  }
}

export const additionalCostIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        additionalCostId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      additionalCostId: req.params.additionalCostId
    }
  }
}

