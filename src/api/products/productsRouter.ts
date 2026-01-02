import express from 'express'
import { container } from 'tsyringe'

import { requireRole, requireToken } from '../../middleware/auth'
import { validate } from '../../middleware/validation'
import { RoleType } from '../role/interface'
import { ProductsController } from './productsController'
import {
  calculateProductPriceSchema,
  createProductSchema,
  getAllProductPricesSchema,
  getAllProductServicePricesSchema,
  listProductsSchema,
  productIdParamSchema,
  updateProductSchema
} from './productsInput'

const productsController = container.resolve(ProductsController)
export const productsRouter = express.Router()

const adminRoles = [RoleType.MASTER_ADMIN, RoleType.ADMIN]

productsRouter.get(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(listProductsSchema),
  productsController.listProducts
)

productsRouter.get(
  '/prices',
  requireToken,
  requireRole(adminRoles),
  validate(getAllProductPricesSchema),
  productsController.getAllProductPrices
)

productsRouter.get(
  '/:productId',
  requireToken,
  requireRole(adminRoles),
  validate(productIdParamSchema),
  productsController.getProduct
)

productsRouter.post(
  '/',
  requireToken,
  requireRole(adminRoles),
  validate(createProductSchema),
  productsController.createProduct
)

productsRouter.put(
  '/:productId',
  requireToken,
  requireRole(adminRoles),
  validate(updateProductSchema),
  productsController.updateProduct
)

productsRouter.delete(
  '/:productId',
  requireToken,
  requireRole(adminRoles),
  validate(productIdParamSchema),
  productsController.deleteProduct
)

productsRouter.get(
  '/:productId/service-prices',
  requireToken,
  requireRole(adminRoles),
  validate(getAllProductServicePricesSchema),
  productsController.getAllProductServicePrices
)

productsRouter.post(
  '/calculate-price',
  requireToken,
  requireRole(adminRoles),
  validate(calculateProductPriceSchema),
  productsController.calculateProductPrice
)
