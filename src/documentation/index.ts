import _ from 'lodash'
import config from './../config'
import { authDocs } from './../api/auth/authDocs'
import { barnahusDocs } from '../api/barnahus/barnahusDocs'
import { languageDocs } from '../api/language/languageDocs'
import { masterAdminDocs } from '../api/master_admin/masterAdminDocs'
import { messageDocs } from '../api/messages/messageDocs'
import { userDocs } from '../api/user/userDocs'
import { adminDocs } from '../api/admin/adminDocs'
import { roomTranslationDocs } from '../api/room_translation/roomTranslationDocs'
import { mediaDocs } from '../api/media/mediaDocs'
import { aboutTranslationDocs } from '../api/about_translation/aboutTranslationDocs'
import { caseDocs } from '../api/case/caseDocs'
import { practitionerDocs } from '../api/practitioner/practitionerDocs'
import { staffTranslationDocs } from '../api/staff_translation/staffTranslationDocs'
import { templateDocs } from '../api/template/templateDocs'
import { contentDocs } from '../api/content/contentDocs'
import { onboardingSectionDocs } from '../api/onboarding_section/onboardingSectionDocs'
import { voiceoverDocs } from '../api/voiceover/voiceoverDocs'

export const APIDocumentation = {
  openapi: '3.0.1',
  info: {
    title: 'Journeys',
    description: 'Journeys API',
    version: '0.1'
  },
  basePath: '/',
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  servers: [
    {
      url: config.API_BASE_URL
    }
  ],
  ..._.mergeWith(
    languageDocs,
    barnahusDocs,
    masterAdminDocs,
    messageDocs,
    userDocs,
    adminDocs,
    authDocs,
    roomTranslationDocs,
    mediaDocs,
    aboutTranslationDocs,
    caseDocs,
    practitionerDocs,
    staffTranslationDocs,
    templateDocs,
    contentDocs,
    onboardingSectionDocs,
    voiceoverDocs,
    (a: object, b: object) => {
      if (_.isArray(a)) {
        return a.concat(b)
      }
    }
  )
}
