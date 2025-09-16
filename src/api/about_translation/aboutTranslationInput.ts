import { Request } from 'express'
import Joi from 'joi'

export const translateAboutSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        aboutId: Joi.string().optional(),
        languageId: Joi.string().required(),
        title: Joi.string().max(50).allow(null).required(),
        description: Joi.string().max(1000).allow(null).required(),
        audioId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .allow(null)
          .optional(),
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
      aboutId: req.body.aboutId,
      languageId: req.body.languageId,
      title: req.body.title,
      description: req.body.description,
      audioId: req.body.audioId,
      images: req.body.images,
      deletedImages: req.body.deletedImages
    }
  }
}

export const getAboutTranslationsSchema = (req: Request) => {
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

export const getAboutTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        aboutTranslationId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      aboutTranslationId: req.params.id
    }
  }
}

export const editAboutTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        aboutTranslationId: Joi.string().regex(
          /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
        ),
        title: Joi.string().max(50).allow(null).required(),
        description: Joi.string().max(1000).allow(null).required(),
        audioId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .allow(null)
          .optional(),
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
      aboutTranslationId: req.body.aboutTranslationId,
      title: req.body.title,
      description: req.body.description,
      images: req.body.images,
      deletedImages: req.body.deletedImages,
      audioId: req.body.audioId
    }
  }
}

export const deleteAboutSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        aboutId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      aboutId: req.body.aboutId
    }
  }
}

export const bulkDeleteAboutSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        aboutIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      aboutIds: req.body.aboutIds
    }
  }
}

export const bulkTranslateAboutSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        translations: Joi.array()
          .items(
            Joi.object()
              .keys({
                aboutId: Joi.string().optional(),
                languageId: Joi.string().required(),
                title: Joi.string().max(50).allow(null).required(),
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
                  .optional(),
                audioId: Joi.string()
                  .regex(
                    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
                  )
                  .allow(null)
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

export const fullTranslateAboutSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        translations: Joi.array().items(
          Joi.object().keys({
            languageId: Joi.string().required(),
            title: Joi.string().max(50).allow(null).required(),
            description: Joi.string().max(1000).allow(null).required(),
            audioId: Joi.string()
              .regex(
                /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
              )
              .allow(null)
              .optional()
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
      translations: req.body.translations,
      images: req.body.images,
      deletedImages: req.body.deletedImages
    }
  }
}
