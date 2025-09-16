import express from 'express'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'
import { OnboardingSectionController } from './onboardingSectionController'
import { requireToken } from '../../middleware/auth'
import {
  createOnboardingSectionSchema,
  deleteOnboardingSectionSchema
} from './onboardingSectionInput'

const onboardingSectionController = container.resolve(
  OnboardingSectionController
)
export const onboardingSectionRouter = express.Router()

onboardingSectionRouter.post(
  '/',
  requireToken,
  validate(createOnboardingSectionSchema),
  onboardingSectionController.createOnboardingSection
)

onboardingSectionRouter.get(
  '/',
  requireToken,
  onboardingSectionController.getOnboardingSections
)

onboardingSectionRouter.delete(
  '/',
  requireToken,
  validate(deleteOnboardingSectionSchema),
  onboardingSectionController.deleteOnboardingSection
)
