import { Request } from 'express'
import Joi from 'joi'

export const createOnboardingSectionSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        onboardingSection: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      onboardingSection: req.body.onboardingSection
    }
  }
}

export const deleteOnboardingSectionSchema = (req: Request) => {
  return {
    schema: Joi.object()
      .keys({
        onboardingSection: Joi.string().required()
      })
      .options({ abortEarly: false }),
    input: {
      onboardingSection: req.body.onboardingSection
    }
  }
}
