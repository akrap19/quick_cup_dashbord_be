import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { ProductStateController } from './productStateController'
import {
  createProductStateSchema,
  listProductStatesSchema,
  productStateIdParamSchema,
  updateProductStateSchema
} from './productStateInput'

const productStateController = container.resolve(ProductStateController)
export const productStateRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

productStateRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listProductStatesSchema),
  productStateController.listProductStates
)

productStateRouter.get(
  '/:productStateId',
  requireToken,
  requireRole(adminRoles),
  validate(productStateIdParamSchema),
  productStateController.getProductState
)

productStateRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createProductStateSchema),
  productStateController.createProductState
)

productStateRouter.put(
  '/:productStateId',
  requireToken,
  requireRole(adminRoles),
  validate(updateProductStateSchema),
  productStateController.updateProductState
)

productStateRouter.delete(
  '/:productStateId',
  requireToken,
  requireRole(adminRoles),
  validate(productStateIdParamSchema),
  productStateController.deleteProductState
)

