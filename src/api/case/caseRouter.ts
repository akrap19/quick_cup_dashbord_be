import express from 'express'
import { CaseController } from './caseController'
import {
  addCaseSchema,
  getCasesSchema,
  editCaseSchema,
  getCaseSchema,
  deleteCaseSchema,
  bulkDeleteCasesSchema,
  searchCasesSchema,
  changeCasePasswordSchema,
  checkCustomIdAvailableSchema
} from './caseInput'
import {
  requireLoginType,
  requireRole,
  requireToken
} from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'
import { LoginType } from '../user_session/interface'

const caseController = container.resolve(CaseController)
export const caseRouter = express.Router()

caseRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(addCaseSchema),
  caseController.addCase
)

caseRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(getCasesSchema),
  caseController.getCases
)

caseRouter.get(
  '/search',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(searchCasesSchema),
  caseController.searchCases
)

caseRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(getCaseSchema),
  caseController.getCase
)

caseRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(editCaseSchema),
  caseController.editCase
)

caseRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(deleteCaseSchema),
  caseController.deleteCase
)

caseRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.PRACTITIONER]),
  requireBarnahus,
  validate(bulkDeleteCasesSchema),
  caseController.bulkDeleteCases
)

caseRouter.put(
  '/password',
  requireToken,
  requireLoginType([LoginType.CASE]),
  validate(changeCasePasswordSchema),
  caseController.changeCasePassword
)

caseRouter.post(
  '/available',
  requireToken,
  requireLoginType([LoginType.WEB]),
  validate(checkCustomIdAvailableSchema),
  caseController.checkCustomIdAvailable
)
