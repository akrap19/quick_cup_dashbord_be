import { Request } from 'express'
import Joi from 'joi'
import { AcquisitionType } from '../products/interface'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const orderProductSchema = Joi.object({
  productId: uuidSchema.required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().precision(4).positive().optional()
})

const orderServiceProductSchema = Joi.object({
  productId: uuidSchema.required(),
  quantity: Joi.number().integer().min(0).required()
})

const orderServiceSchema = Joi.object({
  serviceId: uuidSchema.required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().precision(4).positive().optional(),
  serviceLocationId: uuidSchema.allow(null).optional(),
  quantityByProduct: Joi.array().items(orderServiceProductSchema).optional()
})

const orderAdditionalCostProductSchema = Joi.object({
  productId: uuidSchema.required(),
  quantity: Joi.number().integer().min(0).required(),
  fileId: uuidSchema.allow(null).optional()
})

const orderAdditionalCostSchema = Joi.object({
  additionalCostId: uuidSchema.required(),
  price: Joi.number().precision(4).positive().optional(),
  quantity: Joi.number().integer().min(1).allow(null).optional(),
  quantityByProduct: Joi.array()
    .items(orderAdditionalCostProductSchema)
    .optional()
})

const baseOrderBody = {
  status: Joi.string().min(1).max(64),
  totalAmount: Joi.number().precision(2).positive(),
  notes: Joi.string().allow('', null),
  acquisitionType: Joi.string()
    .valid(AcquisitionType.BUY, AcquisitionType.RENT)
    .optional(),
  customerId: uuidSchema.allow(null).optional(),
  eventId: uuidSchema.allow(null).optional(),
  location: Joi.string().max(255).allow('', null).optional(),
  place: Joi.string().max(255).allow('', null).optional(),
  street: Joi.string().max(255).allow('', null).optional(),
  contactPerson: Joi.string().max(128).allow('', null).optional(),
  contactPersonContact: Joi.string().max(255).allow('', null).optional(),
  discount: Joi.number().precision(2).positive().allow(null).optional(),
  products: Joi.array().items(orderProductSchema).optional(),
  services: Joi.array().items(orderServiceSchema).optional(),
  additionalCosts: Joi.array().items(orderAdditionalCostSchema).optional()
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
        totalAmount: baseOrderBody.totalAmount.optional()
      })
      .options({ abortEarly: false }),
    input: {
      totalAmount: req.body.totalAmount,
      notes: req.body.notes ?? null,
      acquisitionType: req.body.acquisitionType,
      customerId:
        req.body.customerId === '' || req.body.customerId === undefined
          ? null
          : req.body.customerId,
      eventId:
        req.body.eventId === '' || req.body.eventId === undefined
          ? null
          : req.body.eventId,
      location: req.body.location ?? null,
      place: req.body.place ?? null,
      street: req.body.street ?? null,
      contactPerson: req.body.contactPerson ?? null,
      contactPersonContact: req.body.contactPersonContact ?? null,
      discount: req.body.discount ?? null,
      products: req.body.products ?? [],
      services: req.body.services ?? [],
      additionalCosts: req.body.additionalCosts ?? []
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
      status: req.body.status,
      totalAmount: req.body.totalAmount,
      notes: req.body.notes ?? null,
      acquisitionType: req.body.acquisitionType,
      customerId:
        req.body.customerId === '' || req.body.customerId === undefined
          ? null
          : req.body.customerId,
      eventId:
        req.body.eventId === '' || req.body.eventId === undefined
          ? null
          : req.body.eventId,
      location: req.body.location ?? null,
      place: req.body.place ?? null,
      street: req.body.street ?? null,
      contactPerson: req.body.contactPerson ?? null,
      contactPersonContact: req.body.contactPersonContact ?? null,
      discount: req.body.discount ?? null,
      products: req.body.products,
      services: req.body.services,
      additionalCosts: req.body.additionalCosts
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

export const updateOrderStatusSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        orderId: uuidSchema.required(),
        status: Joi.string().min(1).max(64).required()
      })
      .options({ abortEarly: false }),
    input: {
      orderId: req.params.orderId,
      status: req.body.status
    }
  }
}
