import { Request } from 'express'
import Joi from 'joi'
import { LanguageStatus } from './interface'

export const addLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        code: Joi.string().optional(),
        name: Joi.string().min(1).max(36).required(),
        autoTranslate: Joi.bool().required()
      })
      .options({ abortEarly: false }),
    input: {
      code: req.body.code,
      name: req.body.name,
      autoTranslate: req.body.autoTranslate
    }
  }
}

export const getLanguagesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        status: Joi.string()
          .min(1)
          .allow(null)
          .valid(...Object.values(LanguageStatus))
          .optional(),
        page: Joi.number().required(),
        limit: Joi.number().required()
      })
      .options({ abortEarly: false }),
    input: {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit
    }
  }
}

export const searchLanguagesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().max(32).allow('').optional(),
        status: Joi.array()
          .items(Joi.string().valid(...Object.values(LanguageStatus)))
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search,
      status: req.query.status && String(req.query.status).split(',')
    }
  }
}

export const getLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.params.id
    }
  }
}

export const searchSupportedLanguagesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().max(32).allow('').optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search
    }
  }
}

export const editLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        autoTranslate: Joi.bool().required(),
        name: Joi.string().required(),
        status: Joi.string()
          .min(1)
          .allow(null)
          .valid(...Object.values(LanguageStatus))
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId,
      name: req.body.name,
      autoTranslate: req.body.autoTranslate,
      status: req.body.status
    }
  }
}

export const setDefaultLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId
    }
  }
}

export const deleteLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId
    }
  }
}

export const bulkDeleteLanguagesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageIds: req.body.languageIds
    }
  }
}

export const canPublishSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.params.id
    }
  }
}

export const publishLanguageSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId
    }
  }
}

export const autoTranslateSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId
    }
  }
}

export const translateContentSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
          content: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.body.languageId,
      content: req.body.content
    }
  }
}
