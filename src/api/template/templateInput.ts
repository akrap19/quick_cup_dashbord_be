import { Request } from 'express'
import Joi from 'joi'

export const addTemplateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        name: Joi.string().required(),
        isGeneral: Joi.boolean().optional(),
        password: Joi.string().min(8).max(24).allow(null).optional(),
        rooms: Joi.array()
          .items(
            Joi.object({
              roomId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .required(),
              includeAudio: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required(),
              orderNumber: Joi.number().min(1).required()
            })
          )
          .required(),
        abouts: Joi.array()
          .items(
            Joi.object({
              aboutId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .required(),
              includeAudio: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required()
            })
          )
          .required(),
        staff: Joi.array()
          .items(
            Joi.object({
              staffId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .required(),
              includeName: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required()
            })
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      isGeneral: req.body.isGeneral,
      password: req.body.password,
      rooms: req.body.rooms,
      abouts: req.body.abouts,
      staff: req.body.staff
    }
  }
}

export const getTemplatesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).required(),
        search: Joi.string().max(32).allow('').optional()
      })
      .options({ abortEarly: false }),
    input: {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search
    }
  }
}

export const getTemplateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        templateId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      templateId: req.params.id
    }
  }
}

export const editTemplateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        templateId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        isGeneral: Joi.boolean().required(),
        name: Joi.string().required(),
        rooms: Joi.array()
          .items(
            Joi.object({
              roomId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .optional(),
              includeAudio: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required(),
              orderNumber: Joi.number().min(1).required()
            })
          )
          .required(),
        abouts: Joi.array()
          .items(
            Joi.object({
              aboutId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .optional(),
              includeAudio: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required()
            })
          )
          .required(),
        staff: Joi.array()
          .items(
            Joi.object({
              staffId: Joi.string()
                .regex(
                  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                )
                .optional(),
              includeName: Joi.bool().required(),
              includeDescription: Joi.bool().required(),
              includeImages: Joi.bool().required()
            })
          )
          .required(),
        deletedAbouts: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required(),
        deletedRooms: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required(),
        deletedStaff: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      templateId: req.params.id,
      name: req.body.name,
      rooms: req.body.rooms,
      abouts: req.body.abouts,
      staff: req.body.staff,
      deletedAbouts: req.body.deletedAbouts,
      deletedRooms: req.body.deletedRooms,
      deletedStaff: req.body.deletedStaff
    }
  }
}

export const deleteTemplateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        templateId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      templateId: req.body.templateId
    }
  }
}

export const bulkDeleteTemplatesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        templateIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      templateIds: req.body.templateIds
    }
  }
}

export const checkTemplateAvailableSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        name: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name
    }
  }
}

