import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import {
  bulkDeleteRoomSchema,
  bulkTranslateRoomSchema,
  deleteRoomSchema,
  editRoomTranslationSchema,
  fullTranslateRoomSchema,
  getRoomTranslationSchema,
  getRoomTranslationsSchema,
  translateRoomSchema
} from './roomTranslationInput'
import { RoomTranslationController } from './roomTranslationController'
import { RoleType } from '../role/interface'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const roomTranslationController = container.resolve(RoomTranslationController)
export const roomTranslationRouter = express.Router()

roomTranslationRouter.post(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(translateRoomSchema),
  roomTranslationController.translateRoom
)

roomTranslationRouter.get(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getRoomTranslationsSchema),
  roomTranslationController.getRoomTranslations
)

roomTranslationRouter.get(
  '/translation/:id',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(getRoomTranslationSchema),
  roomTranslationController.getRoomTranslation
)

roomTranslationRouter.put(
  '/translation',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(editRoomTranslationSchema),
  roomTranslationController.editRoomTranslation
)

roomTranslationRouter.post(
  '/translation/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkTranslateRoomSchema),
  roomTranslationController.bulkTranslateRooms
)

roomTranslationRouter.post(
  '/translation/full',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(fullTranslateRoomSchema),
  roomTranslationController.fullTranslateRoom
)

roomTranslationRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteRoomSchema),
  roomTranslationController.deleteRoom
)

roomTranslationRouter.delete(
  '/bulk',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(bulkDeleteRoomSchema),
  roomTranslationController.bulkDeleteRooms
)
