import express from 'express'
import { PractitionerController } from './practitionerController'
import {
  addPractitionerSchema,
  getPractitionersSchema,
  deletePractitionerSchema,
  bulkDeletePractitionerSchema,
  editPractitionerSchema,
  getPractitionerSchema
} from './practitionerInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const practitionerController = container.resolve(PractitionerController)
export const practitionerRouter = express.Router()

practitionerRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(addPractitionerSchema),
  practitionerController.addPractitioner
)

practitionerRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getPractitionersSchema),
  practitionerController.getPractitioners
)

practitionerRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getPractitionerSchema),
  practitionerController.getPractitioner
)

practitionerRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deletePractitionerSchema),
  practitionerController.deletePractitioner
)

practitionerRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeletePractitionerSchema),
  practitionerController.bulkDeletePractitioners
)

practitionerRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editPractitionerSchema),
  practitionerController.editPractitioner
)
