import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { StaffTranslationController } from './staffTranslationController'
import { RoleType } from '../role/interface'
import { requireBarnahus } from '../../middleware/barnahus'
import {
  bulkDeleteStaffSchema,
  bulkTranslateStaffSchema,
  deleteStaffSchema,
  editStaffTranslationSchema,
  fullTranslateStaffSchema,
  getStaffTranslationSchema,
  getStaffTranslationsSchema,
  translateStaffSchema
} from './staffTranslationInput'
import { container } from 'tsyringe'

const staffTranslationController = container.resolve(StaffTranslationController)
export const staffTranslationRouter = express.Router()

staffTranslationRouter.post(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(translateStaffSchema),
  staffTranslationController.translateStaff
)

staffTranslationRouter.get(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getStaffTranslationsSchema),
  staffTranslationController.getStaffTranslations
)

staffTranslationRouter.get(
  '/translation/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getStaffTranslationSchema),
  staffTranslationController.getStaffTranslation
)

staffTranslationRouter.put(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editStaffTranslationSchema),
  staffTranslationController.editStaffTranslation
)

staffTranslationRouter.post(
  '/translation/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkTranslateStaffSchema),
  staffTranslationController.bulkTranslateStaff
)

staffTranslationRouter.post(
  '/translation/full',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(fullTranslateStaffSchema),
  staffTranslationController.fullTranslateStaff
)

staffTranslationRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteStaffSchema),
  staffTranslationController.deleteStaff
)

staffTranslationRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteStaffSchema),
  staffTranslationController.bulkDeleteStaff
)
