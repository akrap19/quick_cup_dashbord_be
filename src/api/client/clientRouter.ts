import express from 'express'
import { ClientController } from './clientController'
import {
  addClientSchema,
  getClientsSchema,
  deleteClientSchema,
  bulkDeleteClientSchema,
  editClientSchema,
  getClientSchema
} from './clientInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const clientController = container.resolve(ClientController)
export const clientRouter = express.Router()

clientRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(addClientSchema),
  clientController.addClient
)

clientRouter.get(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(getClientsSchema),
  clientController.getClients
)

clientRouter.get(
  '/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(getClientSchema),
  clientController.getClient
)

clientRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(deleteClientSchema),
  clientController.deleteClient
)

clientRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(bulkDeleteClientSchema),
  clientController.bulkDeleteClients
)

clientRouter.put(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(editClientSchema),
  clientController.editClient
)
