import { Request } from 'express'
import Joi from 'joi'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseOrderBody = {
  orderNumber: Joi.string().min(1).max(64),
  status: Joi.string().min(1).max(64),
  totalAmount: Joi.number().precision(2).positive(),
  customerName: Joi.string().max(128).allow('', null),
  notes: Joi.string().allow('', null)
}

export const listOrdersSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit
  const rawStatus = req.query.status

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        status: Joi.string().allow('', null).optional()
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
      status: Array.isArray(rawStatus)
        ? rawStatus[0]
        : rawStatus === undefined
        ? null
        : rawStatus
    }
  }
}

export const createOrderSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        ...baseOrderBody,
        orderNumber: baseOrderBody.orderNumber.required(),
        status: baseOrderBody.status.required(),
        totalAmount: baseOrderBody.totalAmount.required()
      })
      .options({ abortEarly: false }),
    input: {
      orderNumber: req.body.orderNumber,
      status: req.body.status,
      totalAmount: req.body.totalAmount,
      customerName: req.body.customerName ?? null,
      notes: req.body.notes ?? null
    }
  }
}

export const updateOrderSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        orderId: uuidSchema.required(),
        ...baseOrderBody
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      orderId: req.params.orderId,
      orderNumber: req.body.orderNumber,
      status: req.body.status,
      totalAmount: req.body.totalAmount,
      customerName: req.body.customerName ?? null,
      notes: req.body.notes ?? null
    }
  }
}

export const orderIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        orderId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      orderId: req.params.orderId
    }
  }
}
