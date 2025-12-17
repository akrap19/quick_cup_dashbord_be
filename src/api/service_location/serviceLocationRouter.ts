import express from 'express'
import { ServiceLocationController } from './serviceLocationController'
import {
  createServiceLocationSchema,
  listServiceLocationsSchema,
  serviceLocationIdParamSchema,
  updateServiceLocationSchema
} from './serviceLocationInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

const serviceLocationController = container.resolve(ServiceLocationController)
export const serviceLocationRouter = express.Router()

serviceLocationRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listServiceLocationsSchema),
  serviceLocationController.listServiceLocations
)

serviceLocationRouter.get(
  '/:serviceLocationId',
  requireToken,
  requireRole(adminRoles),
  validate(serviceLocationIdParamSchema),
  serviceLocationController.getServiceLocation
)

serviceLocationRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createServiceLocationSchema),
  serviceLocationController.createServiceLocation
)

serviceLocationRouter.put(
  '/:serviceLocationId',
  requireToken,
  requireRole(adminRoles),
  validate(updateServiceLocationSchema),
  serviceLocationController.updateServiceLocation
)

serviceLocationRouter.delete(
  '/:serviceLocationId',
  requireToken,
  requireRole(adminRoles),
  validate(serviceLocationIdParamSchema),
  serviceLocationController.deleteServiceLocation
)

