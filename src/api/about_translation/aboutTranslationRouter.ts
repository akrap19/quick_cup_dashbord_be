import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { AboutTranslationController } from './aboutTranslationController'
import { RoleType } from '../role/interface'
import {
  bulkDeleteAboutSchema,
  bulkTranslateAboutSchema,
  deleteAboutSchema,
  editAboutTranslationSchema,
  fullTranslateAboutSchema,
  getAboutTranslationSchema,
  getAboutTranslationsSchema,
  translateAboutSchema
} from './aboutTranslationInput'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const aboutTranslationController = container.resolve(AboutTranslationController)
export const aboutTranslationRouter = express.Router()

aboutTranslationRouter.post(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(translateAboutSchema),
  aboutTranslationController.translateAbout
)

aboutTranslationRouter.get(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getAboutTranslationsSchema),
  aboutTranslationController.getAboutTranslations
)

aboutTranslationRouter.get(
  '/translation/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getAboutTranslationSchema),
  aboutTranslationController.getAboutTranslation
)

aboutTranslationRouter.put(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editAboutTranslationSchema),
  aboutTranslationController.editAboutTranslation
)

aboutTranslationRouter.post(
  '/translation/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkTranslateAboutSchema),
  aboutTranslationController.bulkTranslateAbouts
)

aboutTranslationRouter.post(
  '/translation/full',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(fullTranslateAboutSchema),
  aboutTranslationController.fullTranslateAbout
)

aboutTranslationRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteAboutSchema),
  aboutTranslationController.deleteAbout
)

aboutTranslationRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteAboutSchema),
  aboutTranslationController.bulkDeleteAbouts
)
