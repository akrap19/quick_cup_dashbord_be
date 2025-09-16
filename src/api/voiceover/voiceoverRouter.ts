import express from 'express'
import { validate } from '../../middleware/validation'
import { VoiceoverController } from './voiceoverController'
import { getVoiceoverSchema } from './voiceoverInput'
import { container } from 'tsyringe'
import { requireApiKey } from '../../middleware/auth'

const voiceoverController = container.resolve(VoiceoverController)
export const voiceoverRouter = express.Router()

voiceoverRouter.post(
  '/',
  requireApiKey,
  validate(getVoiceoverSchema),
  voiceoverController.getVoiceover
)
