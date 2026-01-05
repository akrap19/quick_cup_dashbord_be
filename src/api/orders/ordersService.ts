import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { getFileURL } from '../../services/cpanel'
import { AcquisitionType } from '../products/interface'
import { ProductMedia } from '../products/productsMediaModel'
import {
  ICreateOrder,
  IDeleteOrder,
  IGetOrderById,
  IListOrders,
  IOrderService,
  IOrdersPagination,
  IUpdateOrder,
  IUpdateOrderStatus
} from './interface'
import { Order } from './ordersModel'
import { OrderProduct } from './orderProductModel'
import { OrderService } from './orderServiceModel'
import { OrderServiceProduct } from './orderServiceProductModel'
import { OrderAdditionalCost } from './orderAdditionalCostModel'
import { OrderAdditionalCostProduct } from './orderAdditionalCostProductModel'
import { AdditionalCost } from '../additional_costs/additionalCostModel'
import { BillingType, MethodOfPayment } from '../additional_costs/interface'
import { OrderStatus, getStatusDescription } from './orderStatus'

type ListOrdersResponse = Awaited<AsyncResponse<IOrdersPagination>>
type OrderResponse = Awaited<AsyncResponse<Order>>
type DeleteOrderResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class OrdersService implements IOrderService {
  private readonly orderRepository: Repository<Order>
  private readonly orderProductRepository: Repository<OrderProduct>
  private readonly orderServiceRepository: Repository<OrderService>
  private readonly orderServiceProductRepository: Repository<OrderServiceProduct>
  private readonly orderAdditionalCostRepository: Repository<OrderAdditionalCost>
  private readonly orderAdditionalCostProductRepository: Repository<OrderAdditionalCostProduct>

  constructor() {
    this.orderRepository = AppDataSource.manager.getRepository(Order)
    this.orderProductRepository =
      AppDataSource.manager.getRepository(OrderProduct)
    this.orderServiceRepository =
      AppDataSource.manager.getRepository(OrderService)
    this.orderServiceProductRepository =
      AppDataSource.manager.getRepository(OrderServiceProduct)
    this.orderAdditionalCostRepository =
      AppDataSource.manager.getRepository(OrderAdditionalCost)
    this.orderAdditionalCostProductRepository =
      AppDataSource.manager.getRepository(OrderAdditionalCostProduct)
  }

  private async generateOrderNumber(
    manager = AppDataSource.manager
  ): Promise<string> {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    const datePrefix = `${day}${month}${year}`
    const orderRepository = manager.getRepository(Order)
    const totalOrders = await orderRepository.count()
    const sequentialNumber = totalOrders + 1
    const sequentialNumberStr = sequentialNumber.toString().padStart(7, '0')

    return `qc-${datePrefix}${sequentialNumberStr}`
  }

  listOrders = async ({
    search,
    page = 1,
    limit = 25,
    status,
    customerId,
    queryRunner
  }: IListOrders): AsyncResponse<IOrdersPagination> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const query = repository.createQueryBuilder('order')

      if (status) {
        query.andWhere('order.status = :status', { status })
      }

      if (customerId) {
        query.andWhere('order.customerId = :customerId', { customerId })
      }

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere('LOWER(order.orderNumber) LIKE :searchLike', {
          searchLike
        })
      }

      const offset = (currentPage - 1) * currentLimit

      const [orders, count] = await query
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('order.services', 'services')
        .leftJoinAndSelect('services.serviceLocation', 'serviceLocation')
        .leftJoinAndSelect('services.products', 'serviceProducts')
        .leftJoinAndSelect('serviceProducts.product', 'serviceProduct')
        .leftJoinAndSelect('order.additionalCosts', 'additionalCosts')
        .leftJoinAndSelect('additionalCosts.additionalCost', 'additionalCost')
        .leftJoinAndSelect('additionalCosts.products', 'additionalCostProducts')
        .leftJoinAndSelect(
          'additionalCostProducts.product',
          'additionalCostProduct'
        )
        .orderBy('order.placedAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      // Enrich orders with status descriptions and transform services
      const enrichedOrders = orders.map((order) => {
        // Transform services to include quantityByProduct
        if (order.services && order.services.length > 0) {
          order.services = order.services.map((service: any) => {
            const quantityByProduct =
              service.products && service.products.length > 0
                ? service.products.map((sp: any) => ({
                    productId: sp.productId,
                    quantity: sp.quantity
                  }))
                : []
            return {
              ...service,
              quantityByProduct
            }
          })
        }

        // Transform additional costs to include quantityByProduct (only for methodOfPayment = 'after')
        if (order.additionalCosts && order.additionalCosts.length > 0) {
          order.additionalCosts = order.additionalCosts.map(
            (additionalCost: any) => {
              const quantityByProduct =
                additionalCost.additionalCost?.methodOfPayment ===
                  MethodOfPayment.AFTER &&
                additionalCost.products &&
                additionalCost.products.length > 0
                  ? additionalCost.products.map((acp: any) => ({
                      productId: acp.productId,
                      quantity: acp.quantity
                    }))
                  : []
              return {
                ...additionalCost,
                quantityByProduct
              }
            }
          )
        }

        const statusDesc = getStatusDescription(order.status)
        return {
          ...order,
          statusInfo: statusDesc
            ? {
                title: statusDesc.title,
                description: statusDesc.description,
                customerMessage: statusDesc.customerMessage,
                adminMessage: statusDesc.adminMessage
              }
            : null
        }
      })

      const response = {
        orders: enrichedOrders,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListOrdersResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListOrdersResponse
  }

  getOrderById = async ({
    orderId,
    customerId,
    queryRunner
  }: IGetOrderById): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const query = repository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .leftJoinAndSelect('product.images', 'productImages')
        .leftJoinAndSelect('productImages.media', 'productMedia')
        .leftJoinAndSelect('order.services', 'services')
        .leftJoinAndSelect('services.service', 'service')
        .leftJoinAndSelect('services.serviceLocation', 'serviceLocation')
        .leftJoinAndSelect('services.products', 'serviceProducts')
        .leftJoinAndSelect('serviceProducts.product', 'serviceProduct')
        .leftJoinAndSelect('order.additionalCosts', 'additionalCosts')
        .leftJoinAndSelect('additionalCosts.additionalCost', 'additionalCost')
        .leftJoinAndSelect('additionalCosts.products', 'additionalCostProducts')
        .leftJoinAndSelect(
          'additionalCostProducts.product',
          'additionalCostProduct'
        )
        .where('order.id = :orderId', { orderId })

      if (customerId) {
        query.andWhere('order.customerId = :customerId', { customerId })
      }

      const order = await query.getOne()

      if (!order) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Transform product images to include URLs (like in getProductById)
      if (order.products && order.products.length > 0) {
        await Promise.all(
          order.products.map(async (orderProduct) => {
            if (orderProduct.product && orderProduct.product.images) {
              const images = await Promise.all(
                orderProduct.product.images.map(async (img: ProductMedia) => {
                  const url = await getFileURL(img.media.url)
                  return {
                    id: img.id,
                    mediaId: img.media.id,
                    name: img.media.name,
                    url: url || img.media.url,
                    createdAt: img.createdAt
                  }
                })
              )
              // Mutate the product images in place
              ;(orderProduct.product as any).images = images
            }
          })
        )
      }

      // Transform services to include quantityByProduct
      if (order.services && order.services.length > 0) {
        order.services = order.services.map((service: any) => {
          const quantityByProduct =
            service.products && service.products.length > 0
              ? service.products.map((sp: any) => ({
                  productId: sp.productId,
                  quantity: sp.quantity
                }))
              : []
          return {
            ...service,
            quantityByProduct
          }
        })
      }

      // Transform additional costs to include quantityByProduct (only for methodOfPayment = 'after')
      if (order.additionalCosts && order.additionalCosts.length > 0) {
        order.additionalCosts = order.additionalCosts.map(
          (additionalCost: any) => {
            const quantityByProduct =
              additionalCost.additionalCost?.methodOfPayment ===
                MethodOfPayment.AFTER &&
              additionalCost.products &&
              additionalCost.products.length > 0
                ? additionalCost.products.map((acp: any) => ({
                    productId: acp.productId,
                    quantity: acp.quantity
                  }))
                : []
            return {
              ...additionalCost,
              quantityByProduct
            }
          }
        )
      }

      // Enrich order with status description
      const statusDesc = getStatusDescription(order.status)
      const enrichedOrder = {
        ...order,
        statusInfo: statusDesc
          ? {
              title: statusDesc.title,
              description: statusDesc.description,
              customerMessage: statusDesc.customerMessage,
              adminMessage: statusDesc.adminMessage
            }
          : null
      }

      return { order: enrichedOrder, code } as unknown as OrderResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as OrderResponse
  }

  createOrder = async ({
    totalAmount,
    notes,
    acquisitionType,
    customerId,
    eventId,
    location,
    place,
    street,
    contactPerson,
    contactPersonContact,
    products,
    services,
    additionalCosts,
    queryRunner
  }: ICreateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const orderRepository = manager.getRepository(Order)
      const orderProductRepository = manager.getRepository(OrderProduct)
      const orderServiceRepository = manager.getRepository(OrderService)
      const orderAdditionalCostRepository =
        manager.getRepository(OrderAdditionalCost)
      const additionalCostRepository = manager.getRepository(AdditionalCost)

      // Generate order number automatically
      const orderNumber = await this.generateOrderNumber(manager)

      const order = orderRepository.create({
        orderNumber,
        status: OrderStatus.PENDING,
        totalAmount,
        notes: notes ?? null,
        acquisitionType: acquisitionType ?? AcquisitionType.BUY,
        customerId: customerId ?? null,
        eventId: eventId ?? null,
        location: location ?? null,
        place: place ?? null,
        street: street ?? null,
        contactPerson: contactPerson ?? null,
        contactPersonContact: contactPersonContact ?? null
      })

      const savedOrder = await orderRepository.save(order)

      // Create order products
      if (products && products.length > 0) {
        const orderProducts = products.map((product) =>
          orderProductRepository.create({
            orderId: savedOrder.id,
            productId: product.productId,
            quantity: product.quantity,
            price: product.price
          })
        )
        await orderProductRepository.save(orderProducts)
      }

      // Create order services
      if (services && services.length > 0) {
        const orderServices = services.map((service) =>
          orderServiceRepository.create({
            orderId: savedOrder.id,
            serviceId: service.serviceId,
            quantity: service.quantity,
            price: service.price,
            serviceLocationId: service.serviceLocationId ?? null
          })
        )
        const savedOrderServices = await orderServiceRepository.save(
          orderServices
        )

        // Create order service products (quantityByProduct)
        if (savedOrderServices.length > 0) {
          const orderServiceProductsData: any[] = []
          savedOrderServices.forEach((savedOrderService, index) => {
            const service = services[index]
            if (
              service.quantityByProduct &&
              service.quantityByProduct.length > 0
            ) {
              service.quantityByProduct.forEach((product) => {
                orderServiceProductsData.push(
                  manager.getRepository(OrderServiceProduct).create({
                    orderServiceId: savedOrderService.id,
                    productId: product.productId,
                    quantity: product.quantity
                  })
                )
              })
            }
          })
          if (orderServiceProductsData.length > 0) {
            await manager
              .getRepository(OrderServiceProduct)
              .save(orderServiceProductsData)
          }
        }
      }

      // Create order additional costs
      if (additionalCosts && additionalCosts.length > 0) {
        const orderAdditionalCostsData = await Promise.all(
          additionalCosts.map(async (additionalCost) => {
            // Fetch the additional cost to check billing type
            const additionalCostEntity = await additionalCostRepository.findOne(
              {
                where: { id: additionalCost.additionalCostId }
              }
            )

            if (!additionalCostEntity) {
              throw new Error(
                `Additional cost with id ${additionalCost.additionalCostId} not found`
              )
            }

            // Quantity is required for "by_piece" billing type, optional/null for "one_time"
            let quantity: number | null = null
            if (additionalCostEntity.billingType === BillingType.BY_PIECE) {
              if (
                typeof additionalCost.quantity === 'undefined' ||
                additionalCost.quantity === null
              ) {
                throw new Error(
                  `Quantity is required for additional cost with billing type "by_piece"`
                )
              }
              quantity = additionalCost.quantity
            }

            return orderAdditionalCostRepository.create({
              orderId: savedOrder.id,
              additionalCostId: additionalCost.additionalCostId,
              price: additionalCost.price,
              quantity
            })
          })
        )
        await orderAdditionalCostRepository.save(orderAdditionalCostsData)
      }

      // Reload order with relationships
      const orderWithRelations = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .leftJoinAndSelect('product.images', 'productImages')
        .leftJoinAndSelect('productImages.media', 'productMedia')
        .leftJoinAndSelect('order.services', 'services')
        .leftJoinAndSelect('services.service', 'service')
        .leftJoinAndSelect('services.serviceLocation', 'serviceLocation')
        .leftJoinAndSelect('services.products', 'serviceProducts')
        .leftJoinAndSelect('serviceProducts.product', 'serviceProduct')
        .leftJoinAndSelect('order.additionalCosts', 'additionalCosts')
        .leftJoinAndSelect('additionalCosts.additionalCost', 'additionalCost')
        .leftJoinAndSelect('additionalCosts.products', 'additionalCostProducts')
        .leftJoinAndSelect(
          'additionalCostProducts.product',
          'additionalCostProduct'
        )
        .where('order.id = :orderId', { orderId: savedOrder.id })
        .getOne()

      if (!orderWithRelations) {
        return {
          order: savedOrder,
          code
        } as unknown as OrderResponse
      }

      // Transform product images to include URLs (like in getProductById)
      if (
        orderWithRelations.products &&
        orderWithRelations.products.length > 0
      ) {
        await Promise.all(
          orderWithRelations.products.map(async (orderProduct) => {
            if (orderProduct.product && orderProduct.product.images) {
              const images = await Promise.all(
                orderProduct.product.images.map(async (img: ProductMedia) => {
                  const url = await getFileURL(img.media.url)
                  return {
                    id: img.id,
                    mediaId: img.media.id,
                    name: img.media.name,
                    url: url || img.media.url,
                    createdAt: img.createdAt
                  }
                })
              )
              // Mutate the product images in place
              ;(orderProduct.product as any).images = images
            }
          })
        )
      }

      // Transform services to include quantityByProduct
      if (
        orderWithRelations.services &&
        orderWithRelations.services.length > 0
      ) {
        orderWithRelations.services = orderWithRelations.services.map(
          (service: any) => {
            const quantityByProduct =
              service.products && service.products.length > 0
                ? service.products.map((sp: any) => ({
                    productId: sp.productId,
                    quantity: sp.quantity
                  }))
                : []
            return {
              ...service,
              quantityByProduct
            }
          }
        )
      }

      // Enrich order with status description
      const statusDesc = getStatusDescription(orderWithRelations.status)
      const enrichedOrder = {
        ...orderWithRelations,
        statusInfo: statusDesc
          ? {
              title: statusDesc.title,
              description: statusDesc.description,
              customerMessage: statusDesc.customerMessage,
              adminMessage: statusDesc.adminMessage
            }
          : null
      }

      return {
        order: enrichedOrder,
        code
      } as unknown as OrderResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as OrderResponse
  }

  updateOrder = async ({
    orderId,
    status,
    totalAmount,
    notes,
    acquisitionType,
    customerId,
    eventId,
    location,
    place,
    street,
    contactPerson,
    contactPersonContact,
    products,
    services,
    additionalCosts,
    queryRunner
  }: IUpdateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const orderRepository = manager.getRepository(Order)
      const orderProductRepository = manager.getRepository(OrderProduct)
      const orderServiceRepository = manager.getRepository(OrderService)
      const orderAdditionalCostRepository =
        manager.getRepository(OrderAdditionalCost)
      const additionalCostRepository = manager.getRepository(AdditionalCost)

      // Check if order exists
      const existingOrder = await orderRepository.findOne({
        where: { id: orderId }
      })

      if (!existingOrder) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const updateData: Partial<Order> = {}

      // Order number is immutable and cannot be updated
      if (typeof status !== 'undefined') {
        updateData.status = status
      }
      if (typeof totalAmount !== 'undefined') {
        updateData.totalAmount = totalAmount
      }
      if (typeof notes !== 'undefined') {
        updateData.notes = notes ?? null
      }
      if (typeof acquisitionType !== 'undefined') {
        updateData.acquisitionType = acquisitionType
      }
      if (typeof customerId !== 'undefined') {
        updateData.customerId = customerId ?? null
      }
      if (typeof eventId !== 'undefined') {
        updateData.eventId = eventId ?? null
      }
      if (typeof location !== 'undefined') {
        updateData.location = location ?? null
      }
      if (typeof place !== 'undefined') {
        updateData.place = place ?? null
      }
      if (typeof street !== 'undefined') {
        updateData.street = street ?? null
      }
      if (typeof contactPerson !== 'undefined') {
        updateData.contactPerson = contactPerson ?? null
      }
      if (typeof contactPersonContact !== 'undefined') {
        updateData.contactPersonContact = contactPersonContact ?? null
      }

      if (Object.keys(updateData).length > 0) {
        await orderRepository
          .createQueryBuilder()
          .update(Order)
          .set(updateData)
          .where('id = :orderId', { orderId })
          .execute()
      }

      // Update products if provided
      if (typeof products !== 'undefined') {
        // Delete existing products
        await orderProductRepository.delete({ orderId })

        // Create new products
        if (products && products.length > 0) {
          const orderProducts = products.map((product) =>
            orderProductRepository.create({
              orderId,
              productId: product.productId,
              quantity: product.quantity,
              price: product.price
            })
          )
          await orderProductRepository.save(orderProducts)
        }
      }

      // Update services if provided
      if (typeof services !== 'undefined') {
        // Delete existing service products first (due to foreign key constraint)
        const existingOrderServices = await orderServiceRepository.find({
          where: { orderId }
        })
        if (existingOrderServices.length > 0) {
          const existingOrderServiceIds = existingOrderServices.map(
            (os) => os.id
          )
          const orderServiceProductRepo =
            manager.getRepository(OrderServiceProduct)
          await orderServiceProductRepo
            .createQueryBuilder()
            .delete()
            .where('orderServiceId IN (:...ids)', {
              ids: existingOrderServiceIds
            })
            .execute()
        }

        // Delete existing services
        await orderServiceRepository.delete({ orderId })

        // Create new services
        if (services && services.length > 0) {
          const orderServices = services.map((service) =>
            orderServiceRepository.create({
              orderId,
              serviceId: service.serviceId,
              quantity: service.quantity,
              price: service.price,
              serviceLocationId: service.serviceLocationId ?? null
            })
          )
          const savedOrderServices = await orderServiceRepository.save(
            orderServices
          )

          // Create order service products (quantityByProduct)
          if (savedOrderServices.length > 0) {
            const orderServiceProductsData: any[] = []
            savedOrderServices.forEach((savedOrderService, index) => {
              const service = services[index]
              if (
                service.quantityByProduct &&
                service.quantityByProduct.length > 0
              ) {
                service.quantityByProduct.forEach((product) => {
                  orderServiceProductsData.push(
                    manager.getRepository(OrderServiceProduct).create({
                      orderServiceId: savedOrderService.id,
                      productId: product.productId,
                      quantity: product.quantity
                    })
                  )
                })
              }
            })
            if (orderServiceProductsData.length > 0) {
              await manager
                .getRepository(OrderServiceProduct)
                .save(orderServiceProductsData)
            }
          }
        }
      }

      // Update additional costs if provided
      if (typeof additionalCosts !== 'undefined') {
        // Delete existing additional cost products first (due to foreign key constraint)
        const existingOrderAdditionalCosts =
          await orderAdditionalCostRepository.find({
            where: { orderId }
          })
        if (existingOrderAdditionalCosts.length > 0) {
          const existingOrderAdditionalCostIds =
            existingOrderAdditionalCosts.map((oac) => oac.id)
          const orderAdditionalCostProductRepo = manager.getRepository(
            OrderAdditionalCostProduct
          )
          await orderAdditionalCostProductRepo
            .createQueryBuilder()
            .delete()
            .where('orderAdditionalCostId IN (:...ids)', {
              ids: existingOrderAdditionalCostIds
            })
            .execute()
        }

        // Delete existing additional costs
        await orderAdditionalCostRepository.delete({ orderId })

        // Create new additional costs
        if (additionalCosts && additionalCosts.length > 0) {
          const orderAdditionalCostsData = await Promise.all(
            additionalCosts.map(async (additionalCost) => {
              // Fetch the additional cost to check billing type
              const additionalCostEntity =
                await additionalCostRepository.findOne({
                  where: { id: additionalCost.additionalCostId }
                })

              if (!additionalCostEntity) {
                throw new Error(
                  `Additional cost with id ${additionalCost.additionalCostId} not found`
                )
              }

              // Quantity is required for "by_piece" billing type, optional/null for "one_time"
              let quantity: number | null = null
              if (additionalCostEntity.billingType === BillingType.BY_PIECE) {
                if (
                  typeof additionalCost.quantity === 'undefined' ||
                  additionalCost.quantity === null
                ) {
                  throw new Error(
                    `Quantity is required for additional cost with billing type "by_piece"`
                  )
                }
                quantity = additionalCost.quantity
              }

              return orderAdditionalCostRepository.create({
                orderId,
                additionalCostId: additionalCost.additionalCostId,
                price: additionalCost.price,
                quantity
              })
            })
          )
          const savedOrderAdditionalCosts =
            await orderAdditionalCostRepository.save(orderAdditionalCostsData)

          // Create order additional cost products (quantityByProduct) - only for methodOfPayment = 'after'
          if (savedOrderAdditionalCosts.length > 0) {
            const orderAdditionalCostProductsData: any[] = []
            for (let i = 0; i < savedOrderAdditionalCosts.length; i++) {
              const savedOrderAdditionalCost = savedOrderAdditionalCosts[i]
              const additionalCost = additionalCosts[i]

              // Fetch the additional cost entity to check methodOfPayment
              const additionalCostEntity =
                await additionalCostRepository.findOne({
                  where: { id: additionalCost.additionalCostId }
                })

              // Only save quantityByProduct if methodOfPayment is 'after'
              if (
                additionalCostEntity?.methodOfPayment ===
                  MethodOfPayment.AFTER &&
                additionalCost.quantityByProduct &&
                additionalCost.quantityByProduct.length > 0
              ) {
                additionalCost.quantityByProduct.forEach((product) => {
                  orderAdditionalCostProductsData.push(
                    manager.getRepository(OrderAdditionalCostProduct).create({
                      orderAdditionalCostId: savedOrderAdditionalCost.id,
                      productId: product.productId,
                      quantity: product.quantity
                    })
                  )
                })
              }
            }
            if (orderAdditionalCostProductsData.length > 0) {
              await manager
                .getRepository(OrderAdditionalCostProduct)
                .save(orderAdditionalCostProductsData)
            }
          }
        }
      }

      // Reload order with relationships
      const { order, code: getCode } = await this.getOrderById({
        orderId,
        queryRunner
      })

      if (!order) {
        return { code: getCode }
      }

      return { order, code } as unknown as OrderResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as OrderResponse
  }

  deleteOrder = async ({
    orderId,
    queryRunner
  }: IDeleteOrder): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const result = await repository.delete({ id: orderId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code } as unknown as DeleteOrderResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as DeleteOrderResponse
  }

  updateOrderStatus = async ({
    orderId,
    status,
    queryRunner
  }: IUpdateOrderStatus): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager
      const orderRepository = manager.getRepository(Order)

      // Check if order exists
      const existingOrder = await orderRepository.findOne({
        where: { id: orderId }
      })

      if (!existingOrder) {
        return { code: ResponseCode.NOT_FOUND }
      }

      // Update only the status
      await orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ status })
        .where('id = :orderId', { orderId })
        .execute()

      // Reload order with relationships
      const { order, code: getCode } = await this.getOrderById({
        orderId,
        queryRunner
      })

      if (!order) {
        return { code: getCode }
      }

      return { order, code } as unknown as OrderResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as OrderResponse
  }
}
