import express from 'express'
import { ServicesController } from './serviceController'
import {
  calculateServicePriceForMultipleProductsSchema,
  calculateServicePriceSchema,
  createServiceSchema,
  getAllServiceLocationsSchema,
  getAllServicePricesSchema,
  listServicesSchema,
  serviceIdParamSchema,
  updateServiceSchema
} from './serviceInput'
import { requireRole, requireToken } from '../../middleware/auth'
import { RoleType } from '../role/interface'
import { validate } from '../../middleware/validation'
import { container } from 'tsyringe'

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

const servicesController = container.resolve(ServicesController)
export const serviceRouter = express.Router()

serviceRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listServicesSchema),
  servicesController.listServices
)

serviceRouter.get(
  '/prices',
  requireToken,
  requireRole(adminRoles),
  validate(getAllServicePricesSchema),
  servicesController.getAllServicePrices
)

serviceRouter.get(
  '/service-locations',
  requireToken,
  requireRole([RoleType.MASTER_ADMIN, RoleType.ADMIN, RoleType.SERVICE]),
  validate(getAllServiceLocationsSchema),
  servicesController.getAllServiceLocations
)

serviceRouter.get(
  '/:serviceId',
  requireToken,
  requireRole(adminRoles),
  validate(serviceIdParamSchema),
  servicesController.getService
)

serviceRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createServiceSchema),
  servicesController.createService
)

serviceRouter.put(
  '/:serviceId',
  requireToken,
  requireRole(adminRoles),
  validate(updateServiceSchema),
  servicesController.updateService
)

serviceRouter.delete(
  '/:serviceId',
  requireToken,
  requireRole(adminRoles),
  validate(serviceIdParamSchema),
  servicesController.deleteService
)

serviceRouter.post(
  '/:serviceId/calculate-price',
  requireToken,
  requireRole(adminRoles),
  validate(calculateServicePriceSchema),
  servicesController.calculateServicePrice
)

serviceRouter.post(
  '/:serviceId/calculate-price-multiple',
  requireToken,
  requireRole(adminRoles),
  validate(calculateServicePriceForMultipleProductsSchema),
  servicesController.calculateServicePriceForMultipleProducts
)
