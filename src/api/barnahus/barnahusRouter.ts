import express from 'express'
import { BarnahusController } from './barnahusController'
import {
  bulkDeleteBarnahusSchema,
  createBarnahusSchema,
  deleteBarnahusSchema,
  editBarnahusSchema,
  searchBarnahusLocationsSchema,
  getBarnahusSchema,
  getBarnahusesSchema,
  getBarnahusTranslationsSchema
} from './barnahusInput'
import { validate } from '../../middleware/validation'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { placesAPIRateLimiter } from '../../middleware/rate_limiter'
import { container } from 'tsyringe'

const barnahusController = container.resolve(BarnahusController)
export const barnahusRouter = express.Router()

barnahusRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(createBarnahusSchema),
  barnahusController.createBarnahus
)

barnahusRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(getBarnahusesSchema),
  barnahusController.getBarnahuses
)

barnahusRouter.get(
  '/locations/search',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(searchBarnahusLocationsSchema),
  placesAPIRateLimiter,
  barnahusController.searchBarnahusLocations
)

barnahusRouter.get(
  '/locations',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  barnahusController.getBarnahusLocations
)

barnahusRouter.get(
  '/assignable',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(searchBarnahusLocationsSchema),
  placesAPIRateLimiter,
  barnahusController.getAssignableBarnahuses
)

barnahusRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(getBarnahusSchema),
  barnahusController.getBarnahus
)

barnahusRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(editBarnahusSchema),
  barnahusController.editBarnahus
)

barnahusRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(deleteBarnahusSchema),
  barnahusController.deleteBarnahus
)

barnahusRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(bulkDeleteBarnahusSchema),
  barnahusController.bulkDeleteBarnahuses
)

barnahusRouter.get(
  '/:id/translations',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN]),
  validate(getBarnahusTranslationsSchema),
  barnahusController.getBarnahusTranslations
)
