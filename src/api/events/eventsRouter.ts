import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { EventsController } from './eventsController'
import {
  createEventSchema,
  eventIdParamSchema,
  listEventsSchema,
  updateEventSchema
} from './eventsInput'

const eventsController = container.resolve(EventsController)
export const eventsRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

eventsRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listEventsSchema),
  eventsController.listEvents
)

eventsRouter.get(
  '/:eventId',
  requireToken,
  requireRole(adminRoles),
  validate(eventIdParamSchema),
  eventsController.getEvent
)

eventsRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createEventSchema),
  eventsController.createEvent
)

eventsRouter.put(
  '/:eventId',
  requireToken,
  requireRole(adminRoles),
  validate(updateEventSchema),
  eventsController.updateEvent
)

eventsRouter.delete(
  '/:eventId',
  requireToken,
  requireRole(adminRoles),
  validate(eventIdParamSchema),
  eventsController.deleteEvent
)
