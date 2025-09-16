import { Request } from 'express'
import Joi from 'joi'
import { CaseStatus } from './interface'

export const addCaseSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        customId: Joi.string().min(1).max(36).required(),
        canAddNotes: Joi.boolean().required(),
        password: Joi.string().min(8).max(24).allow(null).optional()
      })
      .options({ abortEarly: false }),
    input: {
      customId: req.body.customId,
      canAddNotes: req.body.canAddNotes,
      password: req.body.password
    }
  }
}

export const getCasesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().max(32).allow('').optional(),
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).required()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    }
  }
}

export const searchCasesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().max(32).allow('').optional(),
        status: Joi.array()
          .items(Joi.string().valid(...Object.values(CaseStatus)))
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search,
      status: req.query.status && String(req.query.status).split(',')
    }
  }
}

export const getCaseSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      caseId: req.params.id
    }
  }
}

export const editCaseSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        customId: Joi.string().min(1).max(36).allow(null).optional(),
        canAddNotes: Joi.boolean().allow(null).optional(),
        password: Joi.string().min(8).max(24).allow(null).optional()
      })
      .options({ abortEarly: false }),
    input: {
      caseId: req.body.caseId,
      customId: req.body.customId,
      canAddNotes: req.body.canAddNotes,
      password: req.body.password
    }
  }
}

export const deleteCaseSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      caseId: req.body.caseId
    }
  }
}

export const bulkDeleteCasesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      caseIds: req.body.caseIds
    }
  }
}

export const changeCasePasswordSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        password: Joi.string().required(),
        newPassword: Joi.string()
          .min(8)
          .max(24)
          // .regex(new RegExp(atob(config.PASSWORD_BASE64_REGEX)))
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      password: req.body.password,
      newPassword: req.body.newPassword
    }
  }
}

export const checkCustomIdAvailableSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        customId: Joi.string().min(1).max(36).required()
      })
      .options({ abortEarly: false }),
    input: {
      customId: req.body.customId
    }
  }
}
