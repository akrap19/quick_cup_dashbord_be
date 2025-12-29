import { Request } from 'express'
import Joi from 'joi'
import {
  ProductStateStatus,
  ProductStateLocation
} from './interface'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseProductStateBody = {
  status: Joi.string()
    .valid(
      ProductStateStatus.AVAILABLE,
      ProductStateStatus.IN_USE,
      ProductStateStatus.MAINTENANCE,
      ProductStateStatus.RESERVED,
      ProductStateStatus.DAMAGED
    )
    .optional(),
  location: Joi.string()
    .valid(ProductStateLocation.SERVICE, ProductStateLocation.USER)
    .optional(),
  quantity: Joi.number().integer().min(0).optional(),
  productId: uuidSchema.optional(),
  serviceId: uuidSchema.allow(null).optional(),
  userId: uuidSchema.allow(null).optional()
}

export const listProductStatesSchema = (req: Request) => {
  const rawSearch = req.query.search
  const rawPage = req.query.page
  const rawLimit = req.query.limit
  const rawStatus = req.query.status
  const rawLocation = req.query.location
  const rawProductId = req.query.productId
  const rawServiceId = req.query.serviceId
  const rawUserId = req.query.userId

  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().allow('', null).optional(),
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).max(100).optional(),
        status: Joi.string()
          .valid(
            ProductStateStatus.AVAILABLE,
            ProductStateStatus.IN_USE,
            ProductStateStatus.MAINTENANCE,
            ProductStateStatus.RESERVED,
            ProductStateStatus.DAMAGED
          )
          .allow('', null)
          .optional(),
        location: Joi.string()
          .valid(ProductStateLocation.SERVICE, ProductStateLocation.USER)
          .allow('', null)
          .optional(),
        productId: uuidSchema.allow('', null).optional(),
        serviceId: uuidSchema.allow('', null).optional(),
        userId: uuidSchema.allow('', null).optional()
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
        : rawStatus,
      location: Array.isArray(rawLocation)
        ? rawLocation[0]
        : rawLocation === undefined
        ? null
        : rawLocation,
      productId: Array.isArray(rawProductId)
        ? rawProductId[0]
        : rawProductId === undefined
        ? null
        : rawProductId,
      serviceId: Array.isArray(rawServiceId)
        ? rawServiceId[0]
        : rawServiceId === undefined
        ? null
        : rawServiceId,
      userId: Array.isArray(rawUserId)
        ? rawUserId[0]
        : rawUserId === undefined
        ? null
        : rawUserId
    }
  }
}

export const createProductStateSchema = (req: Request) => {
  const { location, serviceId, userId } = req.body

  return {
    schema: Joi.object()
      .keys({
        status: Joi.string()
          .valid(
            ProductStateStatus.AVAILABLE,
            ProductStateStatus.IN_USE,
            ProductStateStatus.MAINTENANCE,
            ProductStateStatus.RESERVED,
            ProductStateStatus.DAMAGED
          )
          .required(),
        location: Joi.string()
          .valid(ProductStateLocation.SERVICE, ProductStateLocation.USER)
          .required(),
        quantity: Joi.number().integer().min(0).required(),
        productId: uuidSchema.required(),
        serviceId: uuidSchema
          .when('location', {
            is: ProductStateLocation.SERVICE,
            then: Joi.required(),
            otherwise: Joi.allow(null).optional()
          }),
        userId: uuidSchema
          .when('location', {
            is: ProductStateLocation.USER,
            then: Joi.required(),
            otherwise: Joi.allow(null).optional()
          })
      })
      .custom((value, helpers) => {
        if (value.location === ProductStateLocation.SERVICE && !value.serviceId) {
          return helpers.error('any.custom', {
            message: 'serviceId is required when location is service'
          })
        }
        if (value.location === ProductStateLocation.USER && !value.userId) {
          return helpers.error('any.custom', {
            message: 'userId is required when location is user'
          })
        }
        if (value.location === ProductStateLocation.SERVICE && value.userId) {
          return helpers.error('any.custom', {
            message: 'userId must not be provided when location is service'
          })
        }
        if (value.location === ProductStateLocation.USER && value.serviceId) {
          return helpers.error('any.custom', {
            message: 'serviceId must not be provided when location is user'
          })
        }
        return value
      })
      .options({ abortEarly: false }),
    input: {
      status: req.body.status,
      location: req.body.location,
      productId: req.body.productId,
      serviceId: location === ProductStateLocation.SERVICE ? serviceId : null,
      userId: location === ProductStateLocation.USER ? userId : null
    }
  }
}

export const updateProductStateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productStateId: uuidSchema.required(),
        ...baseProductStateBody
      })
      .min(2)
      .custom((value, helpers) => {
        const location = value.location
        if (location === ProductStateLocation.SERVICE && value.userId) {
          return helpers.error('any.custom', {
            message: 'userId must not be provided when location is service'
          })
        }
        if (location === ProductStateLocation.USER && value.serviceId) {
          return helpers.error('any.custom', {
            message: 'serviceId must not be provided when location is user'
          })
        }
        return value
      })
      .options({ abortEarly: false }),
    input: {
      productStateId: req.params.productStateId,
      status: req.body.status,
      location: req.body.location,
      productId: req.body.productId,
      serviceId: req.body.serviceId,
      userId: req.body.userId
    }
  }
}

export const productStateIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        productStateId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      productStateId: req.params.productStateId
    }
  }
}

