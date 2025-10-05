import express from 'express'

import { docsRouter } from './docs'
import { authRouter } from '../api/auth/authRouter'
import { masterAdminRouter } from '../api/master_admin/masterAdminRouter'
import { userRouter } from '../api/user/userRouter'
import { adminRouter } from '../api/admin/adminRouter'
import { clientRouter } from '../api/client/clientRouter'
import { serviceRouter } from '../api/service/serviceRouter'
import { mediaRouter } from '../api/media/mediaRouter'

const router = express.Router()

router.use('/api-docs', docsRouter)
router.use('/auth', authRouter)
router.use('/master-admin', masterAdminRouter)
router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/client', clientRouter)
router.use('/service', serviceRouter)
router.use('/media', mediaRouter)

export default router
