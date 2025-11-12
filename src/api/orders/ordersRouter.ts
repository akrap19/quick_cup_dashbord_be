import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { OrdersController } from './ordersController'
import {
  createOrderSchema,
  listOrdersSchema,
  orderIdParamSchema,
  updateOrderSchema
} from './ordersInput'

const ordersController = container.resolve(OrdersController)
export const ordersRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

ordersRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listOrdersSchema),
  ordersController.listOrders
)

ordersRouter.get(
  '/:orderId',
  requireToken,
  requireRole(adminRoles),
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
  '/:orderId',
  requireToken,
  requireRole(adminRoles),
  validate(orderIdParamSchema),
  ordersController.deleteOrder
)
