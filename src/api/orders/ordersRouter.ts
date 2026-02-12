import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { OrdersController } from './ordersController'
import {
  bulkDeleteOrderSchema,
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
  updateOrderSchema,
  updateOrderStatusSchema
} from './ordersInput'

const ordersController = container.resolve(OrdersController)
export const ordersRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]
const allowedRolesForGet = [
  RoleType.MASTER_ADMIN,
  RoleType.ADMIN,
  RoleType.CLIENT
]

ordersRouter.get(
  '/',
  requireToken,
  requireRole(allowedRolesForGet),
  validate(listOrdersSchema),
  ordersController.listOrders
)

ordersRouter.get(
  '/:orderId',
  requireToken,
  requireRole(allowedRolesForGet),
  validate(orderIdParamSchema),
  ordersController.getOrder
)

ordersRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createOrderSchema),
  ordersController.createOrder
)

ordersRouter.put(
  '/:orderId',
  requireToken,
  requireRole(adminRoles),
  validate(updateOrderSchema),
  ordersController.updateOrder
)

ordersRouter.delete(
  '/bulk',
  requireToken,
  requireRole(adminRoles),
  validate(bulkDeleteOrderSchema),
  ordersController.bulkDeleteOrders
)

ordersRouter.delete(
  '/:orderId',
  requireToken,
  requireRole(adminRoles),
  validate(orderIdParamSchema),
  ordersController.deleteOrder
)

ordersRouter.patch(
  '/:orderId/status',
  requireToken,
  requireRole(adminRoles),
  validate(updateOrderStatusSchema),
  ordersController.updateOrderStatus
)
