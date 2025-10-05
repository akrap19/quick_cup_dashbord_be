import express from 'express'
import { AdminController } from './adminController'
import {
  addAdminSchema,
  getAdminsSchema,
  editAdminSchema,
  getAdminSchema,
  deleteAdminSchema,
  bulkDeleteAdminSchema
} from './adminInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const adminController = container.resolve(AdminController)
export const adminRouter = express.Router()

adminRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(addAdminSchema),
  adminController.addAdmin
)

adminRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getAdminsSchema),
  adminController.getAdmins
)

adminRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getAdminSchema),
  adminController.getAdmin
)

adminRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(editAdminSchema),
  adminController.editAdmin
)

adminRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(deleteAdminSchema),
  adminController.deleteAdmin
)

adminRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(bulkDeleteAdminSchema),
  adminController.bulkDeleteAdmins
)
