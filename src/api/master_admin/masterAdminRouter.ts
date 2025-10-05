import express from 'express'
import { MasterAdminController } from './masterAdminController'
import {
  addMasterAdminSchema,
  getMasterAdminsSchema,
  deleteMasterAdminSchema,
  bulkDeleteMasterAdminSchema,
  editMasterAdminSchema,
  getMasterAdminSchema
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
  requireRole([RoleType.MASTER_ADMIN]),
  validate(addMasterAdminSchema),
  masterAdminController.addMasterAdmin
)

masterAdminRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getMasterAdminsSchema),
  masterAdminController.getMasterAdmins
)

masterAdminRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(getMasterAdminSchema),
  masterAdminController.getMasterAdmin
)

masterAdminRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(deleteMasterAdminSchema),
  masterAdminController.deleteMasterAdmin
)

masterAdminRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(bulkDeleteMasterAdminSchema),
  masterAdminController.bulkDeleteMasterAdmins
)

masterAdminRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN]),
  validate(editMasterAdminSchema),
  masterAdminController.editMasterAdmin
)
