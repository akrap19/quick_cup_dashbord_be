import { Request } from 'express'
import Joi from 'joi'
import { NoteType } from '../note/interface'

export const getContentSchema = (req: Request) => {
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
      languageId: req.query.languageId
    }
  }
}

export const getCasesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        search: Joi.string().min(1).allow(null).optional()
      })
      .options({ abortEarly: false }),
    input: {
      search: req.query.search
    }
  }
}

export const getCaseContentSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      caseId: req.params.id
    }
  }
}

export const getBarnahusContentSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        locationCode: Joi.string().required(),
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      locationCode: req.params.id,
      languageId: req.query.languageId
    }
  }
}

export const setCaseContentSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        templateId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      caseId: req.body.caseId,
      templateId: req.body.templateId,
      languageId: req.body.languageId
    }
  }
}

export const setCustomCaseContentSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        caseId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        languageId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
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
      caseId: req.body.caseId,
      languageId: req.body.languageId,
      rooms: req.body.rooms,
      abouts: req.body.abouts,
      staff: req.body.staff
    }
  }
}

export const getLanguagesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        locationCode: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      locationCode: req.params.id
    }
  }
}

export const createNoteSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        contentId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        type: Joi.string()
          .valid(...Object.values(NoteType))
          .required(),
        note: Joi.string().max(500).required()
      })
      .options({ abortEarly: false }),
    input: {
      contentId: req.body.contentId,
      type: req.body.type,
      note: req.body.note
    }
  }
}

export const editNoteSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        noteId: Joi.string()
          .regex(
            /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
          )
          .required(),
        type: Joi.string()
          .valid(...Object.values(NoteType))
          .required(),
        note: Joi.string().max(500).required()
      })
      .options({ abortEarly: false }),
    input: {
      noteId: req.body.noteId,
      type: req.body.type,
      note: req.body.note
    }
  }
}

export const deleteNotesSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        customId: Joi.string().required(),
        aboutNotes: Joi.array()
          .items(
            Joi.string()
              .regex(
                /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
              )
          )
          .min(0)
          .required(),
        roomNotes: Joi.array()
          .items(
            Joi.string()
              .regex(
                /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
              )
          )
          .min(0)
          .required(),
        staffNotes: Joi.array()
          .items(
            Joi.string()
              .regex(
                /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
              )
          )
          .min(0)
          .required()
      })
      .options({ abortEarly: false }),
    input: {
      customId: req.body.customId,
      aboutNotes: req.body.aboutNotes,
      roomNotes: req.body.roomNotes,
      staffNotes: req.body.staffNotes
    }
  }
}
