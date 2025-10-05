import express from 'express'
import { ServiceController } from './serviceController'
import {
  addServiceSchema,
  getServicesSchema,
  editServiceSchema,
  getServiceSchema,
  deleteServiceSchema,
  bulkDeleteServiceSchema
} from './serviceInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const serviceController = container.resolve(ServiceController)
export const serviceRouter = express.Router()

serviceRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(addServiceSchema),
  serviceController.addService
)

serviceRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getServicesSchema),
  serviceController.getServices
)

serviceRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getServiceSchema),
  serviceController.getService
)

serviceRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(editServiceSchema),
  serviceController.editService
)

serviceRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(deleteServiceSchema),
  serviceController.deleteService
)

serviceRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(bulkDeleteServiceSchema),
  serviceController.bulkDeleteServices
)
