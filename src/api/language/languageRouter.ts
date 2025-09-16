import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import {
  addLanguageSchema,
  autoTranslateSchema,
  bulkDeleteLanguagesSchema,
  canPublishSchema,
  deleteLanguageSchema,
  editLanguageSchema,
  getLanguageSchema,
  getLanguagesSchema,
  searchSupportedLanguagesSchema,
  publishLanguageSchema,
  searchLanguagesSchema,
  setDefaultLanguageSchema,
  translateContentSchema
} from './languageInput'
import { LanguageController } from './languageController'
import { RoleType } from '../role/interface'
import { languagesAPIRateLimiter } from '../../middleware/rate_limiter'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const languageController = container.resolve(LanguageController)
export const languageRouter = express.Router()

languageRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(addLanguageSchema),
  languageController.addLanguage
)

languageRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getLanguagesSchema),
  languageController.getLanguages
)

languageRouter.get(
  '/search',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(searchLanguagesSchema),
  languageController.searchLanguages
)

languageRouter.get(
  '/supported',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(searchSupportedLanguagesSchema),
  languagesAPIRateLimiter,
  languageController.searchSupportedLanguages
)

languageRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getLanguageSchema),
  languageController.getLanguage
)

languageRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteLanguageSchema),
  languageController.deleteLanguage
)

languageRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteLanguagesSchema),
  languageController.bulkDeleteLanguages
)

languageRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editLanguageSchema),
  languageController.editLanguage
)

languageRouter.get(
  '/:id/publishable',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(canPublishSchema),
  languageController.canPublishLanguage
)

languageRouter.post(
  '/publish',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(publishLanguageSchema),
  languageController.publishLanguage
)

languageRouter.post(
  '/translate',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(autoTranslateSchema),
  languageController.autoTranslate
)

languageRouter.post(
  '/translate/content',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(translateContentSchema),
  languageController.translateContent
)

languageRouter.put(
  '/default',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(setDefaultLanguageSchema),
  languageController.setDefaultLanguage
)
