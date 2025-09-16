import express from 'express'

import { docsRouter } from './docs'
import { authRouter } from '../api/auth/authRouter'
import { barnahusRouter } from '../api/barnahus/barnahusRouter'
import { masterAdminRouter } from '../api/master_admin/masterAdminRouter'
import { userRouter } from '../api/user/userRouter'
import { messageRouter } from '../api/messages/messageRouter'
import { adminRouter } from '../api/admin/adminRouter'
import { languageRouter } from '../api/language/languageRouter'
import { practitionerRouter } from '../api/practitioner/practitionerRouter'
import { mediaRouter } from '../api/media/mediaRouter'
import { roomTranslationRouter } from '../api/room_translation/roomTranslationRouter'
import { aboutTranslationRouter } from '../api/about_translation/aboutTranslationRouter'
import { caseRouter } from '../api/case/caseRouter'
import { staffTranslationRouter } from '../api/staff_translation/staffTranslationRouter'
import { templateRouter } from '../api/template/templateRouter'
import { contentRouter } from '../api/content/contentRouter'
import { onboardingSectionRouter } from '../api/onboarding_section/onboardingSectionRouter'
import { voiceoverRouter } from '../api/voiceover/voiceoverRouter'

const router = express.Router()

router.use('/api-docs', docsRouter)
router.use('/auth', authRouter)
router.use('/barnahus', barnahusRouter)
router.use('/master-admin', masterAdminRouter)
router.use('/user', userRouter)
router.use('/message', messageRouter)
router.use('/admin', adminRouter)
router.use('/language', languageRouter)
router.use('/practitioner', practitionerRouter)
router.use('/media', mediaRouter)
router.use('/room/translation', roomTranslationRouter)
router.use('/about/translation', aboutTranslationRouter)
router.use('/case', caseRouter)
router.use('/room', roomTranslationRouter)
router.use('/about', aboutTranslationRouter)
router.use('/staff', staffTranslationRouter)
router.use('/template', templateRouter)
router.use('/content', contentRouter)
router.use('/onboarding', onboardingSectionRouter)
router.use('/voiceover', voiceoverRouter)

export default router
