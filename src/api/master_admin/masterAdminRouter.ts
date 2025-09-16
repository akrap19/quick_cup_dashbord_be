import express from 'express'
import { MasterAdminController } from './masterAdminController'
import {
  addMasterAdminSchema,
  getMasterAdminsSchema,
  deleteMasterAdminSchema,
  bulkDeleteMasterAdminSchema,
  editMasterAdminSchema,
  getMasterAdminSchema,
  getAssignableMasterAdminsSchema
} from './masterAdminInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const masterAdminController = container.resolve(MasterAdminController)
export const masterAdminRouter = express.Router()

masterAdminRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(addMasterAdminSchema),
  masterAdminController.addMasterAdmin
)

masterAdminRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(getMasterAdminsSchema),
  masterAdminController.getMasterAdmins
)

masterAdminRouter.get(
  '/assignable',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(getAssignableMasterAdminsSchema),
  masterAdminController.getAssignableMasterAdmins
)

masterAdminRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(getMasterAdminSchema),
  masterAdminController.getMasterAdmin
)

masterAdminRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(deleteMasterAdminSchema),
  masterAdminController.deleteMasterAdmin
)

masterAdminRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(bulkDeleteMasterAdminSchema),
  masterAdminController.bulkDeleteMasterAdmins
)

masterAdminRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.SUPER_ADMIN]),
  validate(editMasterAdminSchema),
  masterAdminController.editMasterAdmin
)
