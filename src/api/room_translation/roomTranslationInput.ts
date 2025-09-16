import { Request } from 'express'
import Joi from 'joi'

export const translateRoomSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        roomId: Joi.string().optional(),
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
      roomId: req.body.roomId,
      languageId: req.body.languageId,
      title: req.body.title,
      description: req.body.description,
      images: req.body.images,
      deletedImages: req.body.deletedImages,
      audioId: req.body.audioId
    }
  }
}

export const getRoomTranslationsSchema = (req: Request) => {
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

export const getRoomTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        roomTranslationId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      roomTranslationId: req.params.id
    }
  }
}

export const editRoomTranslationSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        roomTranslationId: Joi.string().regex(
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
      roomTranslationId: req.body.roomTranslationId,
      title: req.body.title,
      description: req.body.description,
      images: req.body.images,
      deletedImages: req.body.deletedImages,
      audioId: req.body.audioId
    }
  }
}

export const deleteRoomSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        roomId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      roomId: req.body.roomId
    }
  }
}

export const bulkDeleteRoomSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        roomIds: Joi.array()
          .items(
            Joi.string().regex(
              /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
            )
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      roomIds: req.body.roomIds
    }
  }
}

export const bulkTranslateRoomSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        translations: Joi.array()
          .items(
            Joi.object()
              .keys({
                roomId: Joi.string().optional(),
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

export const fullTranslateRoomSchema = (req: Request) => {
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
