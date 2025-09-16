import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { deleteMediaSchema, uploadMediaSchema } from './mediaInput'
import { MediaController } from './mediaController'
import { requireBarnahus } from '../../middleware/barnahus'
import { container } from 'tsyringe'

const mediaController = container.resolve(MediaController)
export const mediaRouter = express.Router()

mediaRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(uploadMediaSchema),
  mediaController.uploadMedia
)

mediaRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  requireBarnahus,
  validate(deleteMediaSchema),
  mediaController.deleteMedia
)
