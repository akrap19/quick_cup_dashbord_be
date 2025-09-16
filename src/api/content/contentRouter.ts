import express from 'express'
import { ContentController } from './contentController'
import {
  requireLoginType,
  requireRole,
  requireToken
} from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'
import { LoginType } from '../user_session/interface'
import {
  createNoteSchema,
  deleteNotesSchema,
  editNoteSchema,
  getBarnahusContentSchema,
  getCaseContentSchema,
  getCasesSchema,
  getContentSchema,
  getLanguagesSchema,
  setCaseContentSchema,
  setCustomCaseContentSchema
} from './contentInput'
import { validate } from '../../middleware/validation'

const contentController = container.resolve(ContentController)
export const contentRouter = express.Router()

contentRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireLoginType([LoginType.WEB]),
  requireBarnahus,
  validate(getContentSchema),
  contentController.getContent
)

contentRouter.get(
  '/template',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireLoginType([LoginType.WEB]),
  requireBarnahus,
  contentController.getTemplateContent
)

contentRouter.get(
  '/barnahus',
  requireToken,
  requireLoginType([LoginType.MOBILE]),
  requireRole([RoleType.PRACTITIONER]),
  contentController.getBarnahuses
)

contentRouter.get(
  '/barnahus/:id',
  requireToken,
  requireLoginType([LoginType.CASE]),
  validate(getBarnahusContentSchema),
  contentController.getBarnahusContent
)

contentRouter.get(
  '/case',
  requireToken,
  requireLoginType([LoginType.MOBILE, LoginType.WEB]),
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getCasesSchema),
  contentController.getCases
)

contentRouter.post(
  '/case',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireLoginType([LoginType.WEB]),
  requireBarnahus,
  validate(setCaseContentSchema),
  contentController.setCaseContent
)

contentRouter.post(
  '/case/custom',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireLoginType([LoginType.WEB]),
  requireBarnahus,
  validate(setCustomCaseContentSchema),
  contentController.setCustomCaseContent
)

contentRouter.get(
  '/case/custom',
  requireToken,
  requireLoginType([LoginType.CASE]),
  contentController.getCaseContentByLoginId
)

contentRouter.get(
  '/case/:id',
  requireToken,
  requireLoginType([LoginType.MOBILE, LoginType.WEB]),
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(getCaseContentSchema),
  contentController.getCaseContent
)

contentRouter.get(
  '/language/:id',
  requireToken,
  requireLoginType([LoginType.CASE]),
  requireBarnahus,
  validate(getLanguagesSchema),
  contentController.getLanguages
)

contentRouter.post(
  '/note',
  requireToken,
  requireLoginType([LoginType.CASE]),
  validate(createNoteSchema),
  contentController.createNote
)

contentRouter.get(
  '/note',
  requireToken,
  requireLoginType([LoginType.CASE]),
  contentController.getNotes
)

contentRouter.delete(
  '/note',
  requireToken,
  requireLoginType([LoginType.CASE]),
  validate(deleteNotesSchema),
  contentController.deleteNotes
)

contentRouter.get(
  '/note/status',
  requireToken,
  requireLoginType([LoginType.CASE]),
  contentController.checkCanAddNotes
)

contentRouter.put(
  '/note',
  requireToken,
  requireLoginType([LoginType.CASE]),
  validate(editNoteSchema),
  contentController.editNote
)
