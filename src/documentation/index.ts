import _ from 'lodash'
import config from './../config'
import { authDocs } from './../api/auth/authDocs'
import { masterAdminDocs } from '../api/master_admin/masterAdminDocs'
import { userDocs } from '../api/user/userDocs'
import { adminDocs } from '../api/admin/adminDocs'
import { clientDocs } from '../api/client/clientDocs'
import { serviceDocs } from '../api/service/serviceDocs'
import { mediaDocs } from '../api/media/mediaDocs'
import { productsDocs } from '../api/products/productsDocs'
import { eventsDocs } from '../api/events/eventsDocs'
import { ordersDocs } from '../api/orders/ordersDocs'

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
    masterAdminDocs,
    userDocs,
    adminDocs,
    clientDocs,
    serviceDocs,
    authDocs,
    mediaDocs,
    productsDocs,
    eventsDocs,
    ordersDocs,
    (a: object, b: object) => {
      if (_.isArray(a)) {
        return a.concat(b)
      }
    }
  )
}
