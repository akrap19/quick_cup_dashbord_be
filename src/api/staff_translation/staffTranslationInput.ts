import { Request } from 'express'
import Joi from 'joi'

export const translateStaffSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        staffId: Joi.string().optional(),
        languageId: Joi.string().required(),
        title: Joi.string().max(50).allow(null).required(),
        name: Joi.string().max(50).required(),
        description: Joi.string().max(1000).allow(null).required(),
        images: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional(),
        deletedImages: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      staffId: req.body.staffId,
      languageId: req.body.languageId,
      title: req.body.title,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      deletedImages: req.body.deletedImages
    }
  }
}

export const getStaffTranslationsSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        page: Joi.number().min(1).required(),
        limit: Joi.number().min(1).required()
      })
      .options({ abortEarly: false }),
    input: {
      languageId: req.query.languageId,
      page: req.query.page,
      limit: req.query.limit
    }
  }
}

export const getStaffTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        staffTranslationId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      staffTranslationId: req.params.id
    }
  }
}

export const editStaffTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        staffTranslationId: Joi.string().regex(
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
        ),
        title: Joi.string().max(50).allow(null).required(),
        name: Joi.string().max(50).required(),
        description: Joi.string().max(1000).allow(null).required(),
        images: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional(),
        deletedImages: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      staffTranslationId: req.body.staffTranslationId,
      title: req.body.title,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      deletedImages: req.body.deletedImages
    }
  }
}

export const deleteStaffSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        staffId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      staffId: req.body.staffId
    }
  }
}

export const bulkDeleteStaffSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        staffIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      staffIds: req.body.staffIds
    }
  }
}

export const bulkTranslateStaffSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        translations: Joi.array()
          .items(
            Joi.object()
              .keys({
                staffId: Joi.string().optional(),
                languageId: Joi.string().required(),
                title: Joi.string().max(50).allow(null).required(),
                name: Joi.string().max(50).required(),
                description: Joi.string().max(1000).allow(null).required(),
                images: Joi.array()
                  .items(
                    Joi.string().regex(
                      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                    )
                  )
                  .optional(),
                deletedImages: Joi.array()
                  .items(
                    Joi.string().regex(
                      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                    )
                  )
                  .optional()
              })
              .options({ abortEarly: false })
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      translations: req.body.translations
    }
  }
}

export const fullTranslateStaffSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        name: Joi.string().required(),
        translations: Joi.array().items(
          Joi.object().keys({
            languageId: Joi.string().required(),
            title: Joi.string().max(50).allow(null).required(),
            description: Joi.string().max(1000).allow(null).required()
          })
        ),
        images: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional(),
        deletedImages: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .optional()
      })
      .options({ abortEarly: false }),
    input: {
      name: req.body.name,
      translations: req.body.translations,
      images: req.body.images,
      deletedImages: req.body.deletedImages
    }
  }
}
