import express from 'express'
import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { UserController } from './userController'
import {
  userEmailSchema,
  userPasswordSchema,
  userPersonalSettingsSchema,
  validateEmailSchema
} from './userInput'
import { container } from 'tsyringe'
import { requireBarnahus } from '../../middleware/barnahus'
import { RoleType } from '../role/interface'

const userController = container.resolve(UserController)
export const userRouter = express.Router()

userRouter.get(
  '/settings',
  requireToken,
  requireRole([
    RoleType.SUPER_ADMIN,
    RoleType.MASTER_ADMIN,
    RoleType.ADMIN,
    RoleType.PRACTITIONER
  ]),
  requireBarnahus,
  userController.getUserSettings
)

userRouter.put(
  '/personal',
  requireToken,
  validate(userPersonalSettingsSchema),
  userController.editUserPersonalSettings
)

userRouter.put(
  '/password',
  requireToken,
  validate(userPasswordSchema),
  userController.editUserPassword
)

userRouter.put(
  '/email',
  requireToken,
  validate(userEmailSchema),
  userController.editUserEmail
)

userRouter.get(
  '/validateEmail/:uid/:hashUid',
  validate(validateEmailSchema),
  userController.validateUserEmail
)
