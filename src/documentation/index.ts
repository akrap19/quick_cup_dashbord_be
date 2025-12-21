import _ from 'lodash'
import config from './../config'
import { authDocs } from './../api/auth/authDocs'
import { masterAdminDocs } from '../api/master_admin/masterAdminDocs'
import { userDocs } from '../api/user/userDocs'
import { adminDocs } from '../api/admin/adminDocs'
import { clientDocs } from '../api/client/clientDocs'
import { serviceDocs } from '../api/service/serviceDocs'
import { serviceLocationDocs } from '../api/service_location/serviceLocationDocs'
import { mediaDocs } from '../api/media/mediaDocs'
import { productsDocs } from '../api/products/productsDocs'
import { eventsDocs } from '../api/events/eventsDocs'
import { ordersDocs } from '../api/orders/ordersDocs'
import { additionalCostDocs } from '../api/additional_costs/additionalCostDocs'

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
    serviceLocationDocs,
    authDocs,
    mediaDocs,
    productsDocs,
    eventsDocs,
    ordersDocs,
    additionalCostDocs,
    (a: object, b: object) => {
      if (_.isArray(a)) {
        return a.concat(b)
      }
    }
  )
}
