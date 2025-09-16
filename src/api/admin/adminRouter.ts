import express from 'express'
import { AdminController } from './adminController'
import {
  addAdminSchema,
  getAdminsSchema,
  deleteAdminSchema,
  bulkDeleteAdminSchema,
  editAdminSchema,
  getAdminSchema
} from './adminInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const adminController = container.resolve(AdminController)
export const adminRouter = express.Router()

adminRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(addAdminSchema),
  adminController.addAdmin
)

adminRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getAdminsSchema),
  adminController.getAdmins
)

adminRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getAdminSchema),
  adminController.getAdmin
)

adminRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteAdminSchema),
  adminController.deleteAdmin
)

adminRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteAdminSchema),
  adminController.bulkDeleteAdmins
)

adminRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editAdminSchema),
  adminController.editAdmin
)
