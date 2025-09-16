import express from 'express'
import { TemplateController } from './templateController'
import {
  addTemplateSchema,
  getTemplatesSchema,
  editTemplateSchema,
  getTemplateSchema,
  deleteTemplateSchema,
  bulkDeleteTemplatesSchema,
  checkTemplateAvailableSchema
} from './templateInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const templateController = container.resolve(TemplateController)
export const templateRouter = express.Router()

templateRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(addTemplateSchema),
  templateController.addTemplate
)

templateRouter.get(
  '/',
  requireToken,
  requireRole([ RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getTemplatesSchema),
  templateController.getTemplates
)

templateRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getTemplateSchema),
  templateController.getTemplate
)

templateRouter.put(
  '/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editTemplateSchema),
  templateController.editTemplate
)

templateRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteTemplateSchema),
  templateController.deleteTemplate
)

templateRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteTemplatesSchema),
  templateController.bulkDeleteTemplates
)

templateRouter.post(
  '/available',
  requireToken,
  requireRole([RoleType.PRACTITIONER, RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(checkTemplateAvailableSchema),
  templateController.checkTemplateAvailable
)
