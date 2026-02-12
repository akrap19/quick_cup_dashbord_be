import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { AdditionalCostsController } from './additionalCostController'
import {
  bulkDeleteAdditionalCostSchema,
  createAdditionalCostSchema,
  listAdditionalCostsSchema,
  additionalCostIdParamSchema,
  updateAdditionalCostSchema
} from './additionalCostInput'

const additionalCostsController = container.resolve(AdditionalCostsController)
export const additionalCostRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

additionalCostRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listAdditionalCostsSchema),
  additionalCostsController.listAdditionalCosts
)

additionalCostRouter.get(
  '/:additionalCostId',
  requireToken,
  requireRole(adminRoles),
  validate(additionalCostIdParamSchema),
  additionalCostsController.getAdditionalCost
)

additionalCostRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createAdditionalCostSchema),
  additionalCostsController.createAdditionalCost
)

additionalCostRouter.put(
  '/:additionalCostId',
  requireToken,
  requireRole(adminRoles),
  validate(updateAdditionalCostSchema),
  additionalCostsController.updateAdditionalCost
)

additionalCostRouter.delete(
  '/bulk',
  requireToken,
  requireRole(adminRoles),
  validate(bulkDeleteAdditionalCostSchema),
  additionalCostsController.bulkDeleteAdditionalCosts
)

additionalCostRouter.delete(
  '/:additionalCostId',
  requireToken,
  requireRole(adminRoles),
  validate(additionalCostIdParamSchema),
  additionalCostsController.deleteAdditionalCost
)

