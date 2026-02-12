import { Request } from 'express'
import Joi from 'joi'

const uuidSchema = Joi.string().guid({ version: 'uuidv4' })

const baseEventBody = {
  title: Joi.string().min(1).max(128),
  description: Joi.string().allow('', null),
  startDate: Joi.date(),
  endDate: Joi.date().allow(null),
  location: Joi.string().max(255).allow('', null),
  place: Joi.string().max(255).allow('', null),
  street: Joi.string().max(255).allow('', null)
}

export const listEventsSchema = (req: Request) => {
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

export const createEventSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        ...baseEventBody,
        userId: uuidSchema.required(),
        title: baseEventBody.title.required(),
        startDate: baseEventBody.startDate.required()
      })
      .options({ abortEarly: false }),
    input: {
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description ?? null,
      startDate: req.body.startDate,
      endDate: req.body.endDate ?? null,
      location: req.body.location ?? null,
      place: req.body.place ?? null,
      street: req.body.street ?? null
    }
  }
}

export const updateEventSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        eventId: uuidSchema.required(),
        ...baseEventBody,
        userId: uuidSchema.optional()
      })
      .min(2)
      .options({ abortEarly: false }),
    input: {
      eventId: req.params.eventId,
      userId: req.body.userId,
      title: req.body.title,
      description: req.body.description ?? null,
      startDate: req.body.startDate,
      endDate: req.body.endDate ?? null,
      location: req.body.location ?? null,
      place: req.body.place ?? null,
      street: req.body.street ?? null
    }
  }
}

export const eventIdParamSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        eventId: uuidSchema.required()
      })
      .options({ abortEarly: false }),
    input: {
      eventId: req.params.eventId
    }
  }
}

export const bulkDeleteEventSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        eventIds: Joi.array()
          .items(uuidSchema)
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      eventIds: req.body.eventIds
    }
  }
}
