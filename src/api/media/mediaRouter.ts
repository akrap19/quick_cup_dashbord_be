import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { deleteMediaSchema, uploadMediaSchema, downloadMediaSchema } from './mediaInput'
import { MediaController } from './mediaController'
import { container } from 'tsyringe'

const mediaController = container.resolve(MediaController)
export const mediaRouter = express.Router()

mediaRouter.post(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(uploadMediaSchema),
  mediaController.uploadMedia
)

mediaRouter.delete(
  '/',
  requireToken,
  requireRole([RoleType.ADMIN, RoleType.MASTER_ADMIN]),
  validate(deleteMediaSchema),
  mediaController.deleteMedia
)

mediaRouter.get(
  '/:mediaId/download',
  requireToken,
  validate(downloadMediaSchema),
  mediaController.downloadMedia
)
