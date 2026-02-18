import { Repository, In } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { getFileURL } from '../../services/cpanel'
import { ProductMedia } from '../products/productsMediaModel'
import {
  IBulkDeleteOrders,
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
import { ProductState } from '../product_state/productStateModel'
import {
  ProductStateStatus,
  ProductStateLocation
} from '../product_state/interface'
import { AcquisitionType } from '../products/interface'
import { Product } from '../products/productsModel'
import { ProductPrice } from '../products/productPriceModel'
import { ProductServicePrice } from '../products/productServicePriceModel'

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
  private readonly productStateRepository: Repository<ProductState>
  private readonly productRepository: Repository<Product>
  private readonly productMediaRepository: Repository<ProductMedia>
  private readonly productPriceRepository: Repository<ProductPrice>
  private readonly productServicePriceRepository: Repository<ProductServicePrice>

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
    this.productStateRepository =
      AppDataSource.manager.getRepository(ProductState)
    this.productRepository = AppDataSource.manager.getRepository(Product)
    this.productMediaRepository =
      AppDataSource.manager.getRepository(ProductMedia)
    this.productPriceRepository =
      AppDataSource.manager.getRepository(ProductPrice)
    this.productServicePriceRepository =
      AppDataSource.manager.getRepository(ProductServicePrice)
  }

  private async generateOrderNumber(
    acquisitionType: AcquisitionType = AcquisitionType.BUY,
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
    const sequentialNumberStr = sequentialNumber.toString().padStart(6, '0')

    return `qc-${acquisitionType}-${datePrefix}${sequentialNumberStr}`
  }

  listOrders = async ({
    search,
    page = 1,
    limit = 25,
    status,
    customerId,
    serviceUserId,
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

      // If serviceUserId is provided, filter orders to only show orders where
      // at least one service has a service location that belongs to this user
      if (serviceUserId) {
        query
          .innerJoin('order.services', 'filterService')
          .innerJoin('filterService.serviceLocation', 'filterServiceLocation')
          .andWhere('filterServiceLocation.userId = :serviceUserId', {
            serviceUserId
          })
          .distinct(true)
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
        .leftJoinAndSelect('order.serviceLocation', 'orderServiceLocation')
        .leftJoinAndSelect(
          'orderServiceLocation.service',
          'orderServiceLocationService'
        )
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
        .leftJoinAndSelect(
          'additionalCostProducts.media',
          'additionalCostProductMedia'
        )
        .orderBy('order.placedAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      // Enrich orders with status descriptions and transform services
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
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

          // Transform additional costs to include quantityByProduct
          // (for methodOfPayment = 'after' OR enableUpload = true)
          if (order.additionalCosts && order.additionalCosts.length > 0) {
            order.additionalCosts = await Promise.all(
              order.additionalCosts.map(async (additionalCost: any) => {
                const shouldIncludeProducts =
                  (additionalCost.additionalCost?.methodOfPayment ===
                    MethodOfPayment.AFTER ||
                    additionalCost.additionalCost?.enableUpload === true) &&
                  additionalCost.products &&
                  additionalCost.products.length > 0

                const quantityByProduct = shouldIncludeProducts
                  ? await Promise.all(
                      (additionalCost.products || []).map(async (acp: any) => {
                        // If enableUpload is true, return file info (even if null), not quantity
                        if (
                          additionalCost.additionalCost?.enableUpload === true
                        ) {
                          const fileUrl =
                            acp.mediaId && acp.media?.url
                              ? await getFileURL(acp.media.url)
                              : null
                          return {
                            productId: acp.productId,
                            fileId: acp.mediaId || null,
                            fileUrl:
                              fileUrl || (acp.media?.url ? acp.media.url : null)
                          }
                        }
                        // Otherwise return quantity (for methodOfPayment = 'after')
                        return {
                          productId: acp.productId,
                          quantity: acp.quantity
                        }
                      })
                    )
                  : []
                return {
                  ...additionalCost,
                  quantityByProduct
                }
              })
            )
          }

          // Transform serviceLocation to include service name
          let transformedServiceLocation = null
          if (order.serviceLocation) {
            transformedServiceLocation = {
              ...order.serviceLocation,
              serviceName: order.serviceLocation.service?.name || null
            }
            // Remove the full service object, keep only the name
            delete (transformedServiceLocation as any).service
          }

          const statusDesc = getStatusDescription(order.status)
          return {
            ...order,
            serviceLocation: transformedServiceLocation, // Include serviceLocation with service name
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
      )

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
        .leftJoinAndSelect('order.serviceLocation', 'orderServiceLocation')
        .leftJoinAndSelect(
          'orderServiceLocation.service',
          'orderServiceLocationService'
        )
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
        .leftJoinAndSelect(
          'additionalCostProducts.media',
          'additionalCostProductMedia'
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

      // Transform additional costs to include quantityByProduct
      // (for methodOfPayment = 'after' OR enableUpload = true)
      if (order.additionalCosts && order.additionalCosts.length > 0) {
        order.additionalCosts = await Promise.all(
          order.additionalCosts.map(async (additionalCost: any) => {
            const shouldIncludeProducts =
              (additionalCost.additionalCost?.methodOfPayment ===
                MethodOfPayment.AFTER ||
                additionalCost.additionalCost?.enableUpload === true) &&
              additionalCost.products &&
              additionalCost.products.length > 0

            const quantityByProduct = shouldIncludeProducts
              ? await Promise.all(
                  additionalCost.products.map(async (acp: any) => {
                    // If enableUpload is true, return file info (even if null), not quantity
                    if (additionalCost.additionalCost?.enableUpload === true) {
                      const fileUrl =
                        acp.mediaId && acp.media?.url
                          ? await getFileURL(acp.media.url)
                          : null
                      return {
                        productId: acp.productId,
                        fileId: acp.mediaId || null,
                        fileUrl:
                          fileUrl || (acp.media?.url ? acp.media.url : null)
                      }
                    }
                    // Otherwise return quantity (for methodOfPayment = 'after')
                    return {
                      productId: acp.productId,
                      quantity: acp.quantity
                    }
                  })
                )
              : []
            return {
              ...additionalCost,
              quantityByProduct
            }
          })
        )
      }

      // Transform serviceLocation to include service name
      let transformedServiceLocation = null
      if (order.serviceLocation) {
        transformedServiceLocation = {
          ...order.serviceLocation,
          serviceName: order.serviceLocation.service?.name || null
        }
        // Remove the full service object, keep only the name
        delete (transformedServiceLocation as any).service
      }

      // Enrich order with status description
      const statusDesc = getStatusDescription(order.status)
      const enrichedOrder = {
        ...order,
        serviceLocation: transformedServiceLocation, // Include serviceLocation with service name
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
    discount,
    serviceLocationId,
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

      const orderNumber = await this.generateOrderNumber(
        acquisitionType ?? AcquisitionType.BUY,
        manager
      )
      const order = orderRepository.create({
        orderNumber,
        status: OrderStatus.PENDING,
        totalAmount: totalAmount ?? 0,
        notes: notes ?? null,
        acquisitionType: acquisitionType ?? AcquisitionType.BUY,
        customerId: customerId ?? null,
        eventId: eventId ?? null,
        location: location ?? null,
        place: place ?? null,
        street: street ?? null,
        contactPerson: contactPerson ?? null,
        contactPersonContact: contactPersonContact ?? null,
        discount: discount ?? null,
        serviceLocationId: serviceLocationId ?? null
      })

      const savedOrder = await orderRepository.save(order)

      // Explicitly update serviceLocationId if provided to ensure it's saved
      if (serviceLocationId !== undefined && serviceLocationId !== null) {
        await orderRepository
          .createQueryBuilder()
          .update(Order)
          .set({ serviceLocationId })
          .where('id = :id', { id: savedOrder.id })
          .execute()
      }

      // Create order products
      if (products && products.length > 0) {
        const orderProducts = products.map((product) =>
          orderProductRepository.create({
            orderId: savedOrder.id,
            productId: product.productId,
            quantity: product.quantity,
            price: product.price ?? 0
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
            price: service.price ?? 0,
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
              price: additionalCost.price ?? 0,
              quantity
            })
          })
        )
        const savedOrderAdditionalCosts =
          await orderAdditionalCostRepository.save(orderAdditionalCostsData)

        // Create order additional cost products (quantityByProduct)
        // - for methodOfPayment = 'after' OR when enableUpload = true
        if (savedOrderAdditionalCosts.length > 0) {
          const orderAdditionalCostProductsData: any[] = []
          for (let i = 0; i < savedOrderAdditionalCosts.length; i++) {
            const savedOrderAdditionalCost = savedOrderAdditionalCosts[i]
            const additionalCost = additionalCosts[i]

            // Fetch the additional cost entity to check methodOfPayment and enableUpload
            const additionalCostEntity = await additionalCostRepository.findOne(
              {
                where: { id: additionalCost.additionalCostId }
              }
            )

            // Save quantityByProduct if methodOfPayment is 'after' OR enableUpload is true
            const shouldSaveProducts =
              (additionalCostEntity?.methodOfPayment ===
                MethodOfPayment.AFTER ||
                additionalCostEntity?.enableUpload === true) &&
              additionalCost.quantityByProduct &&
              additionalCost.quantityByProduct.length > 0

            if (shouldSaveProducts && additionalCost.quantityByProduct) {
              additionalCost.quantityByProduct.forEach((product) => {
                orderAdditionalCostProductsData.push(
                  manager.getRepository(OrderAdditionalCostProduct).create({
                    orderAdditionalCostId: savedOrderAdditionalCost.id,
                    productId: product.productId,
                    quantity: product.quantity,
                    mediaId:
                      additionalCostEntity?.enableUpload === true
                        ? product.fileId ?? null
                        : null
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

      // Reload order with relationships
      const orderWithRelations = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.serviceLocation', 'orderServiceLocation')
        .leftJoinAndSelect(
          'orderServiceLocation.service',
          'orderServiceLocationService'
        )
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
        .leftJoinAndSelect(
          'additionalCostProducts.media',
          'additionalCostProductMedia'
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

      // Transform serviceLocation to include service name
      let transformedServiceLocation = null
      if (orderWithRelations.serviceLocation) {
        transformedServiceLocation = {
          ...orderWithRelations.serviceLocation,
          serviceName: orderWithRelations.serviceLocation.service?.name || null
        }
        // Remove the full service object, keep only the name
        delete (transformedServiceLocation as any).service
      }

      // Enrich order with status description
      const statusDesc = getStatusDescription(orderWithRelations.status)
      const enrichedOrder = {
        ...orderWithRelations,
        serviceLocation: transformedServiceLocation, // Include serviceLocation with service name
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
    discount,
    serviceLocationId,
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

      // Check if order exists and load with relationships if status is changing
      const existingOrder = await orderRepository.findOne({
        where: { id: orderId },
        relations:
          typeof status !== 'undefined' && status === OrderStatus.IN_PRODUCTION
            ? [
                'products',
                'products.product',
                'services',
                'services.serviceLocation',
                'services.products',
                'services.products.product',
                'customer'
              ]
            : []
      })

      if (!existingOrder) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const previousStatus = existingOrder.status
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
      if (typeof discount !== 'undefined') {
        updateData.discount = discount ?? null
      }
      if (typeof serviceLocationId !== 'undefined') {
        updateData.serviceLocationId = serviceLocationId ?? null
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
              price: product.price ?? 0
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
              price: service.price ?? 0,
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
                price: additionalCost.price ?? 0,
                quantity
              })
            })
          )
          const savedOrderAdditionalCosts =
            await orderAdditionalCostRepository.save(orderAdditionalCostsData)

          // Create order additional cost products (quantityByProduct)
          // - for methodOfPayment = 'after' OR when enableUpload = true
          if (savedOrderAdditionalCosts.length > 0) {
            const orderAdditionalCostProductsData: any[] = []
            for (let i = 0; i < savedOrderAdditionalCosts.length; i++) {
              const savedOrderAdditionalCost = savedOrderAdditionalCosts[i]
              const additionalCost = additionalCosts[i]

              // Fetch the additional cost entity to check methodOfPayment and enableUpload
              const additionalCostEntity =
                await additionalCostRepository.findOne({
                  where: { id: additionalCost.additionalCostId }
                })

              // Save quantityByProduct if methodOfPayment is 'after' OR enableUpload is true
              const shouldSaveProducts =
                (additionalCostEntity?.methodOfPayment ===
                  MethodOfPayment.AFTER ||
                  additionalCostEntity?.enableUpload === true) &&
                additionalCost.quantityByProduct &&
                additionalCost.quantityByProduct.length > 0

              if (shouldSaveProducts && additionalCost.quantityByProduct) {
                additionalCost.quantityByProduct.forEach((product) => {
                  orderAdditionalCostProductsData.push(
                    manager.getRepository(OrderAdditionalCostProduct).create({
                      orderAdditionalCostId: savedOrderAdditionalCost.id,
                      productId: product.productId,
                      quantity: product.quantity,
                      mediaId:
                        additionalCostEntity?.enableUpload === true
                          ? product.fileId ?? null
                          : null
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

      // Handle product state updates when status changes to IN_PRODUCTION or FINAL_PAYMENT_PENDING
      if (
        typeof status !== 'undefined' &&
        existingOrder.customerId &&
        (status === OrderStatus.IN_PRODUCTION ||
          status === OrderStatus.FINAL_PAYMENT_PENDING)
      ) {
        // Reload order with all relationships for processing
        const orderForProcessing = await orderRepository.findOne({
          where: { id: orderId },
          relations: [
            'products',
            'products.product',
            'services',
            'services.serviceLocation',
            'services.products',
            'services.products.product',
            'additionalCosts',
            'additionalCosts.additionalCost',
            'additionalCosts.products',
            'additionalCosts.products.product',
            'customer'
          ]
        })

        if (orderForProcessing) {
          // Handle IN_PRODUCTION status change
          if (
            status === OrderStatus.IN_PRODUCTION &&
            previousStatus !== OrderStatus.IN_PRODUCTION
          ) {
            const isBuyOrder =
              orderForProcessing.acquisitionType === AcquisitionType.BUY
            const targetStatus = ProductStateStatus.IN_USE

            // For BUY orders, copy products and create a mapping from original to copied product IDs
            const productIdMap = new Map<string, string>()
            if (isBuyOrder) {
              const uniqueProductIds = new Set<string>()

              // Collect all unique product IDs from direct order products
              if (
                orderForProcessing.products &&
                orderForProcessing.products.length > 0
              ) {
                for (const orderProduct of orderForProcessing.products) {
                  uniqueProductIds.add(orderProduct.productId)
                }
                logger.info({
                  message: `Found ${orderForProcessing.products.length} direct order products`,
                  orderId: orderId,
                  productIds: Array.from(uniqueProductIds)
                })
              }

              // Collect all unique product IDs from order services
              if (
                orderForProcessing.services &&
                orderForProcessing.services.length > 0
              ) {
                for (const orderService of orderForProcessing.services) {
                  if (
                    orderService.products &&
                    orderService.products.length > 0
                  ) {
                    for (const orderServiceProduct of orderService.products) {
                      uniqueProductIds.add(orderServiceProduct.productId)
                    }
                  }
                }
              }

              // Collect all unique product IDs from additional costs
              if (
                orderForProcessing.additionalCosts &&
                orderForProcessing.additionalCosts.length > 0
              ) {
                for (const orderAdditionalCost of orderForProcessing.additionalCosts) {
                  if (
                    orderAdditionalCost.products &&
                    orderAdditionalCost.products.length > 0
                  ) {
                    for (const additionalCostProduct of orderAdditionalCost.products) {
                      uniqueProductIds.add(additionalCostProduct.productId)
                    }
                  }
                }
              }

              logger.info({
                message: `Copying ${uniqueProductIds.size} unique products for BUY order`,
                orderId: orderId,
                customerId: orderForProcessing.customerId,
                productIds: Array.from(uniqueProductIds)
              })

              // Copy each unique product
              for (const originalProductId of uniqueProductIds) {
                const copiedProductId = await this.copyProductForPurchase(
                  originalProductId,
                  orderForProcessing.customerId!,
                  manager
                )
                productIdMap.set(originalProductId, copiedProductId)
              }
            }

            // For BUY orders, create product states directly for purchased products
            // For RENT orders, use the existing processProductForOrder logic
            if (isBuyOrder) {
              const productStateRepository = manager.getRepository(ProductState)
              const processedProducts = new Map<string, number>()

              // Process products from order services
              if (
                orderForProcessing.services &&
                orderForProcessing.services.length > 0
              ) {
                for (const orderService of orderForProcessing.services) {
                  if (
                    !orderService.products ||
                    orderService.products.length === 0
                  ) {
                    continue
                  }

                  for (const orderServiceProduct of orderService.products) {
                    // Use copied product ID for BUY orders
                    const productIdToUse =
                      productIdMap.get(orderServiceProduct.productId) ||
                      orderServiceProduct.productId

                    const key = `${productIdToUse}`
                    const alreadyProcessed = processedProducts.get(key) || 0
                    const quantityToProcess =
                      orderServiceProduct.quantity - alreadyProcessed

                    if (quantityToProcess > 0) {
                      // Always create a new product state for each purchase
                      const newProductState = productStateRepository.create({
                        status: ProductStateStatus.IN_USE,
                        location: ProductStateLocation.USER,
                        quantity: quantityToProcess,
                        productId: productIdToUse,
                        userId: orderForProcessing.customerId!,
                        serviceId: null,
                        serviceLocationId: null
                      })
                      await productStateRepository.save(newProductState)

                      processedProducts.set(
                        key,
                        (processedProducts.get(key) || 0) + quantityToProcess
                      )
                    }
                  }
                }
              }

              // Process direct order products
              if (
                orderForProcessing.products &&
                orderForProcessing.products.length > 0
              ) {
                for (const orderProduct of orderForProcessing.products) {
                  // Use copied product ID for BUY orders
                  const productIdToUse =
                    productIdMap.get(orderProduct.productId) ||
                    orderProduct.productId

                  const key = `${productIdToUse}`
                  const alreadyProcessed = processedProducts.get(key) || 0
                  const quantityToProcess =
                    orderProduct.quantity - alreadyProcessed

                  if (quantityToProcess > 0) {
                    // Always create a new product state for each purchase
                    const newProductState = productStateRepository.create({
                      status: ProductStateStatus.IN_USE,
                      location: ProductStateLocation.USER,
                      quantity: quantityToProcess,
                      productId: productIdToUse,
                      userId: orderForProcessing.customerId!,
                      serviceId: null,
                      serviceLocationId: null
                    })
                    await productStateRepository.save(newProductState)

                    processedProducts.set(
                      key,
                      (processedProducts.get(key) || 0) + quantityToProcess
                    )
                  }
                }
              }
            } else {
              // For RENT orders, use the order's serviceLocationId to take from available products
              // and put them to IN_USE status with USER location, holder is client from order
              const processedProducts = new Map<string, number>()

              // Use the order's serviceLocationId for all product allocations
              const orderServiceLocationId =
                orderForProcessing.serviceLocationId ?? null

              // Process products from order services
              if (
                orderForProcessing.services &&
                orderForProcessing.services.length > 0
              ) {
                for (const orderService of orderForProcessing.services) {
                  if (
                    !orderService.products ||
                    orderService.products.length === 0
                  ) {
                    continue
                  }

                  for (const orderServiceProduct of orderService.products) {
                    const key = `${orderServiceProduct.productId}-${
                      orderServiceLocationId || 'none'
                    }`
                    const alreadyProcessed = processedProducts.get(key) || 0
                    const quantityToProcess =
                      orderServiceProduct.quantity - alreadyProcessed

                    if (quantityToProcess > 0) {
                      await this.processProductForOrder(
                        orderServiceProduct.productId,
                        quantityToProcess,
                        orderServiceLocationId,
                        orderForProcessing.customerId!,
                        targetStatus,
                        manager
                      )
                      processedProducts.set(
                        key,
                        (processedProducts.get(key) || 0) + quantityToProcess
                      )
                    }
                  }
                }
              }

              // Process direct order products for RENT orders
              if (
                orderForProcessing.products &&
                orderForProcessing.products.length > 0
              ) {
                for (const orderProduct of orderForProcessing.products) {
                  const key = `${orderProduct.productId}-${
                    orderServiceLocationId || 'none'
                  }`
                  const alreadyProcessed = processedProducts.get(key) || 0
                  const quantityToProcess =
                    orderProduct.quantity - alreadyProcessed

                  if (quantityToProcess > 0) {
                    await this.processProductForOrder(
                      orderProduct.productId,
                      quantityToProcess,
                      orderServiceLocationId,
                      orderForProcessing.customerId!,
                      targetStatus,
                      manager
                    )
                    processedProducts.set(
                      key,
                      (processedProducts.get(key) || 0) + quantityToProcess
                    )
                  }
                }
              }

              // Process additional costs with calculationStatus for RENT orders
              if (
                orderForProcessing.additionalCosts &&
                orderForProcessing.additionalCosts.length > 0
              ) {
                for (const orderAdditionalCost of orderForProcessing.additionalCosts) {
                  // Only process if additional cost has calculationStatus and products
                  if (
                    !orderAdditionalCost.additionalCost?.calculationStatus ||
                    !orderAdditionalCost.products ||
                    orderAdditionalCost.products.length === 0
                  ) {
                    continue
                  }

                  const calculationStatus =
                    orderAdditionalCost.additionalCost.calculationStatus

                  for (const additionalCostProduct of orderAdditionalCost.products) {
                    const key = `${additionalCostProduct.productId}-${
                      orderServiceLocationId || 'none'
                    }-additional-${orderAdditionalCost.id}`
                    const alreadyProcessed = processedProducts.get(key) || 0
                    const quantityToProcess =
                      additionalCostProduct.quantity - alreadyProcessed

                    if (quantityToProcess > 0) {
                      await this.processProductForOrder(
                        additionalCostProduct.productId,
                        quantityToProcess,
                        orderServiceLocationId,
                        orderForProcessing.customerId!,
                        calculationStatus,
                        manager
                      )
                      processedProducts.set(
                        key,
                        (processedProducts.get(key) || 0) + quantityToProcess
                      )
                    }
                  }
                }
              }
            }

            // Process additional costs with calculationStatus for BUY orders
            if (
              isBuyOrder &&
              orderForProcessing.additionalCosts &&
              orderForProcessing.additionalCosts.length > 0
            ) {
              const productStateRepository = manager.getRepository(ProductState)

              for (const orderAdditionalCost of orderForProcessing.additionalCosts) {
                // Only process if additional cost has calculationStatus and products
                if (
                  !orderAdditionalCost.additionalCost?.calculationStatus ||
                  !orderAdditionalCost.products ||
                  orderAdditionalCost.products.length === 0
                ) {
                  continue
                }

                const calculationStatus =
                  orderAdditionalCost.additionalCost.calculationStatus

                for (const additionalCostProduct of orderAdditionalCost.products) {
                  // Use copied product ID for BUY orders
                  const productIdToUse =
                    productIdMap.get(additionalCostProduct.productId) ||
                    additionalCostProduct.productId

                  // Always create a new product state for each purchase
                  const newProductState = productStateRepository.create({
                    status: calculationStatus,
                    location: ProductStateLocation.USER,
                    quantity: additionalCostProduct.quantity,
                    productId: productIdToUse,
                    userId: orderForProcessing.customerId!,
                    serviceId: null,
                    serviceLocationId: null
                  })
                  await productStateRepository.save(newProductState)
                }
              }
            }
          }

          // Handle FINAL_PAYMENT_PENDING status change
          if (
            status === OrderStatus.FINAL_PAYMENT_PENDING &&
            previousStatus !== OrderStatus.FINAL_PAYMENT_PENDING
          ) {
            const productStateRepository = manager.getRepository(ProductState)

            // Find all product states that belong to this order's customer
            // We need to return products that are in use (for rent), owned (for buy), or have calculationStatus from additional costs
            const baseStatus = ProductStateStatus.IN_USE

            // Get all possible statuses that might need to be returned
            // This includes base status and any calculationStatus from additional costs
            const statusesToReturn = new Set<ProductStateStatus>([baseStatus])
            if (
              orderForProcessing.additionalCosts &&
              orderForProcessing.additionalCosts.length > 0
            ) {
              for (const orderAdditionalCost of orderForProcessing.additionalCosts) {
                if (orderAdditionalCost.additionalCost?.calculationStatus) {
                  statusesToReturn.add(
                    orderAdditionalCost.additionalCost.calculationStatus
                  )
                }
              }
            }

            // Find all product states with any of these statuses
            const productStatesToReturn = await productStateRepository.find({
              where: {
                userId: orderForProcessing.customerId!,
                location: ProductStateLocation.USER,
                status: In(Array.from(statusesToReturn))
              },
              relations: ['product']
            })

            // Track which product states should have calculationStatus (to exclude from service return)
            const calculationStatusStateIds = new Set<string>()

            // FIRST: Process additional costs with calculationStatus
            // We need to process these FIRST to ensure the exact quantities with calculationStatus are returned correctly
            if (
              orderForProcessing.additionalCosts &&
              orderForProcessing.additionalCosts.length > 0
            ) {
              for (const orderAdditionalCost of orderForProcessing.additionalCosts) {
                if (
                  !orderAdditionalCost.additionalCost?.calculationStatus ||
                  !orderAdditionalCost.products ||
                  orderAdditionalCost.products.length === 0
                ) {
                  continue
                }

                const calculationStatus =
                  orderAdditionalCost.additionalCost.calculationStatus

                for (const additionalCostProduct of orderAdditionalCost.products) {
                  // Reload states from database for this product to get latest state
                  // Find product states for this product that belong to the customer with base status
                  // We need to process the exact quantity that was entered for this additional cost
                  const statesForProduct = await productStateRepository.find({
                    where: {
                      productId: additionalCostProduct.productId,
                      userId: orderForProcessing.customerId!,
                      location: ProductStateLocation.USER,
                      status: baseStatus
                    },
                    relations: ['product'],
                    order: { createdAt: 'ASC' }
                  })

                  // Track how much quantity we need to process for this additional cost product
                  let quantityToProcess = additionalCostProduct.quantity

                  for (const state of statesForProduct) {
                    if (quantityToProcess <= 0) {
                      break
                    }

                    // Skip if this state is already marked as calculationStatus
                    if (calculationStatusStateIds.has(state.id)) {
                      continue
                    }

                    // For products with calculationStatus, keep them with the customer (location USER, holder customer)
                    // Determine how much to process from this state
                    const quantityFromState = Math.min(
                      state.quantity,
                      quantityToProcess
                    )

                    if (quantityFromState === state.quantity) {
                      // Update entire state to have calculationStatus, keep with customer (location USER, holder customer)
                      state.status = calculationStatus
                      state.location = ProductStateLocation.USER
                      state.userId = orderForProcessing.customerId
                      state.serviceId = null // Clear serviceId when location is USER
                      state.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)

                      await productStateRepository.save(state)
                      calculationStatusStateIds.add(state.id) // Mark as calculationStatus state
                    } else {
                      // Split: reduce this state's quantity and create new state with calculationStatus
                      state.quantity -= quantityFromState
                      await productStateRepository.save(state)
                      // Original state still has quantity and baseStatus, will be returned to service

                      // Create new state with calculationStatus for the customer (location USER, holder customer)
                      const newState = productStateRepository.create({
                        status: calculationStatus,
                        location: ProductStateLocation.USER,
                        quantity: quantityFromState,
                        productId: state.productId,
                        userId: orderForProcessing.customerId,
                        serviceId: null, // No serviceId when location is USER
                        serviceLocationId: null // No serviceLocationId when location is USER (holder is user, not service)
                      })
                      const savedNewState = await productStateRepository.save(
                        newState
                      )
                      calculationStatusStateIds.add(savedNewState.id) // Mark new state as calculationStatus state
                    }

                    quantityToProcess -= quantityFromState
                  }
                }
              }
            }

            // SECOND: Process products from order services
            // Reload states to get the latest state after processing additional costs
            // Find all product states that still belong to the customer with base status
            // Exclude any states that have calculationStatus (they should stay with customer)
            const remainingProductStates = await productStateRepository.find({
              where: {
                userId: orderForProcessing.customerId!,
                location: ProductStateLocation.SERVICE,
                status: baseStatus
              },
              relations: ['product']
            })

            // Filter out calculationStatus states
            const statesToReturnToService = remainingProductStates.filter(
              (ps) => !calculationStatusStateIds.has(ps.id)
            )

            // Only return states with baseStatus that haven't been processed for calculationStatus
            const productStateMap = new Map<
              string,
              {
                productState: ProductState
                originalServiceLocationId: string | null
              }
            >()

            // Build a map of products that should be returned based on order services
            if (
              orderForProcessing.services &&
              orderForProcessing.services.length > 0
            ) {
              for (const orderService of orderForProcessing.services) {
                if (
                  !orderService.serviceLocationId ||
                  !orderService.products ||
                  orderService.products.length === 0
                ) {
                  continue
                }

                for (const orderServiceProduct of orderService.products) {
                  // Find product states for this product that belong to the customer with base status (IN_USE)
                  // Exclude states that have calculationStatus (they should stay with customer)
                  const statesForProduct = statesToReturnToService.filter(
                    (ps) =>
                      ps.productId === orderServiceProduct.productId &&
                      ps.status === baseStatus &&
                      !productStateMap.has(ps.id)
                  )

                  // Track how much quantity we need to return for this service product
                  let quantityToReturn = orderServiceProduct.quantity

                  for (const state of statesForProduct) {
                    if (quantityToReturn <= 0) {
                      break
                    }

                    // Use the original serviceLocationId if available, otherwise use the current order service location
                    const returnLocationId =
                      state.serviceLocationId || orderService.serviceLocationId

                    if (!returnLocationId) {
                      continue // Skip if no service location to return to
                    }

                    // Determine how much to return from this state
                    const quantityFromState = Math.min(
                      state.quantity,
                      quantityToReturn
                    )

                    if (!productStateMap.has(state.id)) {
                      if (quantityFromState === state.quantity) {
                        // Return entire state
                        productStateMap.set(state.id, {
                          productState: state,
                          originalServiceLocationId: returnLocationId
                        })
                      } else {
                        // Split: reduce this state's quantity and mark part for return
                        state.quantity -= quantityFromState
                        await productStateRepository.save(state)

                        // Create new state with AVAILABLE status for the returned quantity
                        // Holder should be service location (serviceLocationId set, userId null)
                        const returnedState = productStateRepository.create({
                          status: ProductStateStatus.AVAILABLE,
                          location: ProductStateLocation.SERVICE,
                          quantity: quantityFromState,
                          productId: state.productId,
                          serviceLocationId: returnLocationId,
                          serviceId: null, // Clear serviceId when location is SERVICE (holder is service location, not service)
                          userId: null // Clear userId when location is SERVICE (holder is service location, not user)
                        })
                        await productStateRepository.save(returnedState)
                      }

                      quantityToReturn -= quantityFromState
                    }
                  }
                }
              }
            }

            // Return products to their original service locations
            for (const [
              stateId,
              { productState, originalServiceLocationId }
            ] of productStateMap) {
              if (!originalServiceLocationId) {
                continue
              }

              // Defensive check: never process calculationStatus states
              if (calculationStatusStateIds.has(productState.id)) {
                continue
              }

              // Change status to AVAILABLE, location to SERVICE, and restore serviceLocationId
              // Holder should be service location (serviceLocationId set, userId null)
              productState.status = ProductStateStatus.AVAILABLE
              productState.location = ProductStateLocation.SERVICE
              productState.serviceLocationId = originalServiceLocationId
              productState.serviceId = null // Clear serviceId when location is SERVICE (holder is service location, not service)
              productState.userId = null // Clear userId when location is SERVICE (holder is service location, not user)

              await productStateRepository.save(productState)
            }

            // Final verification: Ensure all calculationStatus states are correct
            // Reload and fix any calculationStatus states that might have been incorrectly modified
            if (calculationStatusStateIds.size > 0) {
              const calculationStatusStates = await productStateRepository.find(
                {
                  where: {
                    id: In(Array.from(calculationStatusStateIds)),
                    userId: orderForProcessing.customerId!
                  }
                }
              )

              for (const state of calculationStatusStates) {
                // Ensure calculationStatus states are location USER with customer as holder
                if (
                  state.location !== ProductStateLocation.USER ||
                  state.userId !== orderForProcessing.customerId ||
                  state.serviceLocationId !== null ||
                  state.serviceId !== null
                ) {
                  state.location = ProductStateLocation.USER
                  state.userId = orderForProcessing.customerId
                  state.serviceId = null
                  state.serviceLocationId = null
                  await productStateRepository.save(state)
                }
              }
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

  bulkDeleteOrders = async ({
    orderIds
  }: IBulkDeleteOrders): AsyncResponse<null> => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const orderId of orderIds) {
        const deleteResult = await this.deleteOrder({
          orderId,
          queryRunner
        })

        if (deleteResult.code !== ResponseCode.OK) {
          code = deleteResult.code
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code } as unknown as DeleteOrderResponse
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })

      await queryRunner.rollbackTransaction()
      await queryRunner.release()
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
      const productStateRepository = manager.getRepository(ProductState)

      // Check if order exists and load with relationships
      const existingOrder = await orderRepository.findOne({
        where: { id: orderId },
        relations: [
          'products',
          'products.product',
          'services',
          'services.serviceLocation',
          'services.products',
          'services.products.product',
          'customer'
        ]
      })

      if (!existingOrder) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const previousStatus = existingOrder.status

      // Update only the status
      await orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ status })
        .where('id = :orderId', { orderId })
        .execute()

      // Load additional costs with products for processing
      const orderWithAdditionalCosts = await orderRepository.findOne({
        where: { id: orderId },
        relations: [
          'products',
          'products.product',
          'services',
          'services.serviceLocation',
          'services.products',
          'services.products.product',
          'additionalCosts',
          'additionalCosts.additionalCost',
          'additionalCosts.products',
          'additionalCosts.products.product',
          'customer'
        ]
      })

      // Handle product state updates when status changes to IN_PRODUCTION
      // Process for both BUY and RENT orders (both use IN_USE status)
      if (
        status === OrderStatus.IN_PRODUCTION &&
        previousStatus !== OrderStatus.IN_PRODUCTION &&
        orderWithAdditionalCosts &&
        orderWithAdditionalCosts.customerId
      ) {
        const isBuyOrder =
          orderWithAdditionalCosts.acquisitionType === AcquisitionType.BUY
        const targetStatus = ProductStateStatus.IN_USE

        // Helper function to deduct from available products for BUY orders
        const deductFromAvailableProducts = async (
          originalProductId: string,
          quantityToDeduct: number
        ): Promise<void> => {
          // Find available products in any service location
          const availableProductStates = await productStateRepository.find({
            where: {
              productId: originalProductId,
              status: ProductStateStatus.AVAILABLE,
              location: ProductStateLocation.SERVICE
            },
            order: { createdAt: 'ASC' } // Use oldest first
          })

          let remainingToDeduct = quantityToDeduct

          for (const productState of availableProductStates) {
            if (remainingToDeduct <= 0) {
              break
            }

            const quantityToDeductFromState = Math.min(
              productState.quantity,
              remainingToDeduct
            )

            if (quantityToDeductFromState === productState.quantity) {
              // Remove entire state
              await productStateRepository.remove(productState)
            } else {
              // Reduce quantity
              productState.quantity -= quantityToDeductFromState
              await productStateRepository.save(productState)
            }

            remainingToDeduct -= quantityToDeductFromState
          }
        }

        // For BUY orders, copy products and create a mapping from original to copied product IDs
        const productIdMap = new Map<string, string>()
        if (isBuyOrder) {
          const uniqueProductIds = new Set<string>()

          // Collect all unique product IDs from direct order products
          if (
            orderWithAdditionalCosts.products &&
            orderWithAdditionalCosts.products.length > 0
          ) {
            for (const orderProduct of orderWithAdditionalCosts.products) {
              uniqueProductIds.add(orderProduct.productId)
            }
          }

          // Collect all unique product IDs from order services
          if (
            orderWithAdditionalCosts.services &&
            orderWithAdditionalCosts.services.length > 0
          ) {
            for (const orderService of orderWithAdditionalCosts.services) {
              if (orderService.products && orderService.products.length > 0) {
                for (const orderServiceProduct of orderService.products) {
                  uniqueProductIds.add(orderServiceProduct.productId)
                }
              }
            }
          }

          // Collect all unique product IDs from additional costs
          if (
            orderWithAdditionalCosts.additionalCosts &&
            orderWithAdditionalCosts.additionalCosts.length > 0
          ) {
            for (const orderAdditionalCost of orderWithAdditionalCosts.additionalCosts) {
              if (
                orderAdditionalCost.products &&
                orderAdditionalCost.products.length > 0
              ) {
                for (const additionalCostProduct of orderAdditionalCost.products) {
                  uniqueProductIds.add(additionalCostProduct.productId)
                }
              }
            }
          }

          // Copy each unique product
          for (const originalProductId of uniqueProductIds) {
            const copiedProductId = await this.copyProductForPurchase(
              originalProductId,
              orderWithAdditionalCosts.customerId,
              manager
            )
            productIdMap.set(originalProductId, copiedProductId)
          }
        }

        // For BUY orders, create product states directly for purchased products
        // For RENT orders, use the existing processProductForOrder logic
        if (isBuyOrder) {
          const processedProducts = new Map<string, number>()

          // Process products from order services
          if (
            orderWithAdditionalCosts.services &&
            orderWithAdditionalCosts.services.length > 0
          ) {
            for (const orderService of orderWithAdditionalCosts.services) {
              if (
                !orderService.products ||
                orderService.products.length === 0
              ) {
                continue
              }

              for (const orderServiceProduct of orderService.products) {
                // Use copied product ID for BUY orders
                const productIdToUse =
                  productIdMap.get(orderServiceProduct.productId) ||
                  orderServiceProduct.productId

                const key = `${productIdToUse}`
                const alreadyProcessed = processedProducts.get(key) || 0
                const quantityToProcess =
                  orderServiceProduct.quantity - alreadyProcessed

                if (quantityToProcess > 0) {
                  // Deduct from available products (use original product ID)
                  await deductFromAvailableProducts(
                    orderServiceProduct.productId,
                    quantityToProcess
                  )

                  // Always create a new product state for each purchase
                  const newProductState = productStateRepository.create({
                    status: ProductStateStatus.IN_USE,
                    location: ProductStateLocation.USER,
                    quantity: quantityToProcess,
                    productId: productIdToUse,
                    userId: orderWithAdditionalCosts.customerId,
                    serviceId: null,
                    serviceLocationId: null
                  })
                  await productStateRepository.save(newProductState)

                  processedProducts.set(
                    key,
                    (processedProducts.get(key) || 0) + quantityToProcess
                  )
                }
              }
            }
          }

          // Process direct order products
          if (
            orderWithAdditionalCosts.products &&
            orderWithAdditionalCosts.products.length > 0
          ) {
            for (const orderProduct of orderWithAdditionalCosts.products) {
              // Use copied product ID for BUY orders
              const productIdToUse =
                productIdMap.get(orderProduct.productId) ||
                orderProduct.productId

              const key = `${productIdToUse}`
              const alreadyProcessed = processedProducts.get(key) || 0
              const quantityToProcess = orderProduct.quantity - alreadyProcessed

              if (quantityToProcess > 0) {
                // Deduct from available products (use original product ID)
                await deductFromAvailableProducts(
                  orderProduct.productId,
                  quantityToProcess
                )

                // Check if product state already exists for this product and user
                const existingState = await productStateRepository.findOne({
                  where: {
                    productId: productIdToUse,
                    userId: orderWithAdditionalCosts.customerId,
                    location: ProductStateLocation.USER,
                    status: ProductStateStatus.IN_USE
                  }
                })

                if (existingState) {
                  // Update existing state quantity
                  existingState.quantity += quantityToProcess
                  await productStateRepository.save(existingState)
                } else {
                  // Create new product state
                  const newProductState = productStateRepository.create({
                    status: ProductStateStatus.IN_USE,
                    location: ProductStateLocation.USER,
                    quantity: quantityToProcess,
                    productId: productIdToUse,
                    userId: orderWithAdditionalCosts.customerId,
                    serviceId: null,
                    serviceLocationId: null
                  })
                  await productStateRepository.save(newProductState)
                }

                processedProducts.set(
                  key,
                  (processedProducts.get(key) || 0) + quantityToProcess
                )
              }
            }
          }
        } else {
          // For RENT orders, use the order's serviceLocationId to take from available products
          // and put them to IN_USE status with USER location, holder is client from order
          const processedProducts = new Map<string, number>()

          // Use the order's serviceLocationId for all product allocations
          const orderServiceLocationId =
            orderWithAdditionalCosts.serviceLocationId ?? null

          // Process products from order services
          if (
            orderWithAdditionalCosts.services &&
            orderWithAdditionalCosts.services.length > 0
          ) {
            for (const orderService of orderWithAdditionalCosts.services) {
              if (
                !orderService.products ||
                orderService.products.length === 0
              ) {
                continue
              }

              for (const orderServiceProduct of orderService.products) {
                const key = `${orderServiceProduct.productId}-${
                  orderServiceLocationId || 'none'
                }`
                const alreadyProcessed = processedProducts.get(key) || 0
                const quantityToProcess =
                  orderServiceProduct.quantity - alreadyProcessed

                if (quantityToProcess > 0) {
                  await this.processProductForOrder(
                    orderServiceProduct.productId,
                    quantityToProcess,
                    orderServiceLocationId,
                    orderWithAdditionalCosts.customerId,
                    targetStatus,
                    manager
                  )
                  processedProducts.set(
                    key,
                    (processedProducts.get(key) || 0) + quantityToProcess
                  )
                }
              }
            }
          }

          // Process direct order products for RENT orders
          if (
            orderWithAdditionalCosts.products &&
            orderWithAdditionalCosts.products.length > 0
          ) {
            for (const orderProduct of orderWithAdditionalCosts.products) {
              const key = `${orderProduct.productId}-${
                orderServiceLocationId || 'none'
              }`
              const alreadyProcessed = processedProducts.get(key) || 0
              const quantityToProcess = orderProduct.quantity - alreadyProcessed

              if (quantityToProcess > 0) {
                await this.processProductForOrder(
                  orderProduct.productId,
                  quantityToProcess,
                  orderServiceLocationId,
                  orderWithAdditionalCosts.customerId,
                  targetStatus,
                  manager
                )
                processedProducts.set(
                  key,
                  (processedProducts.get(key) || 0) + quantityToProcess
                )
              }
            }
          }

          // Process additional costs with calculationStatus for RENT orders
          if (
            orderWithAdditionalCosts.additionalCosts &&
            orderWithAdditionalCosts.additionalCosts.length > 0
          ) {
            for (const orderAdditionalCost of orderWithAdditionalCosts.additionalCosts) {
              // Only process if additional cost has calculationStatus and products
              if (
                !orderAdditionalCost.additionalCost?.calculationStatus ||
                !orderAdditionalCost.products ||
                orderAdditionalCost.products.length === 0
              ) {
                continue
              }

              const calculationStatus =
                orderAdditionalCost.additionalCost.calculationStatus

              for (const additionalCostProduct of orderAdditionalCost.products) {
                const key = `${additionalCostProduct.productId}-${
                  orderServiceLocationId || 'none'
                }-additional-${orderAdditionalCost.id}`
                const alreadyProcessed = processedProducts.get(key) || 0
                const quantityToProcess =
                  additionalCostProduct.quantity - alreadyProcessed

                if (quantityToProcess > 0) {
                  await this.processProductForOrder(
                    additionalCostProduct.productId,
                    quantityToProcess,
                    orderServiceLocationId,
                    orderWithAdditionalCosts.customerId,
                    calculationStatus,
                    manager
                  )
                  processedProducts.set(
                    key,
                    (processedProducts.get(key) || 0) + quantityToProcess
                  )
                }
              }
            }
          }
        }

        // Process additional costs with calculationStatus for BUY orders
        if (
          isBuyOrder &&
          orderWithAdditionalCosts.additionalCosts &&
          orderWithAdditionalCosts.additionalCosts.length > 0
        ) {
          for (const orderAdditionalCost of orderWithAdditionalCosts.additionalCosts) {
            // Only process if additional cost has calculationStatus and products
            if (
              !orderAdditionalCost.additionalCost?.calculationStatus ||
              !orderAdditionalCost.products ||
              orderAdditionalCost.products.length === 0
            ) {
              continue
            }

            const calculationStatus =
              orderAdditionalCost.additionalCost.calculationStatus

            for (const additionalCostProduct of orderAdditionalCost.products) {
              // Deduct from available products (use original product ID)
              await deductFromAvailableProducts(
                additionalCostProduct.productId,
                additionalCostProduct.quantity
              )

              // Use copied product ID for BUY orders
              const productIdToUse =
                productIdMap.get(additionalCostProduct.productId) ||
                additionalCostProduct.productId

              // Always create a new product state for each purchase
              const newProductState = productStateRepository.create({
                status: calculationStatus,
                location: ProductStateLocation.USER,
                quantity: additionalCostProduct.quantity,
                productId: productIdToUse,
                userId: orderWithAdditionalCosts.customerId,
                serviceId: null,
                serviceLocationId: null
              })
              await productStateRepository.save(newProductState)
            }
          }
        }
      }

      // Handle product state updates when status changes to FINAL_PAYMENT_PENDING
      // Return products from user back to original service with AVAILABLE status
      if (
        status === OrderStatus.FINAL_PAYMENT_PENDING &&
        previousStatus !== OrderStatus.FINAL_PAYMENT_PENDING &&
        orderWithAdditionalCosts &&
        orderWithAdditionalCosts.customerId
      ) {
        // Find all product states that belong to this order's customer
        // We need to return products that are in use (for rent), owned (for buy), or have calculationStatus from additional costs
        const baseStatus = ProductStateStatus.IN_USE

        // Get all possible statuses that might need to be returned
        // This includes base status and any calculationStatus from additional costs
        const statusesToReturn = new Set<ProductStateStatus>([baseStatus])
        if (
          orderWithAdditionalCosts.additionalCosts &&
          orderWithAdditionalCosts.additionalCosts.length > 0
        ) {
          for (const orderAdditionalCost of orderWithAdditionalCosts.additionalCosts) {
            if (orderAdditionalCost.additionalCost?.calculationStatus) {
              statusesToReturn.add(
                orderAdditionalCost.additionalCost.calculationStatus
              )
            }
          }
        }

        // Find all product states with any of these statuses
        const productStatesToReturn = await productStateRepository.find({
          where: {
            userId: orderWithAdditionalCosts.customerId,
            location: ProductStateLocation.USER,
            status: In(Array.from(statusesToReturn))
          },
          relations: ['product']
        })

        // Track which product states should have calculationStatus (to exclude from service return)
        const calculationStatusStateIds = new Set<string>()

        // FIRST: Process additional costs with calculationStatus
        // We need to process these FIRST to ensure the exact quantities with calculationStatus are returned correctly
        if (
          orderWithAdditionalCosts.additionalCosts &&
          orderWithAdditionalCosts.additionalCosts.length > 0
        ) {
          for (const orderAdditionalCost of orderWithAdditionalCosts.additionalCosts) {
            if (
              !orderAdditionalCost.additionalCost?.calculationStatus ||
              !orderAdditionalCost.products ||
              orderAdditionalCost.products.length === 0
            ) {
              continue
            }

            const calculationStatus =
              orderAdditionalCost.additionalCost.calculationStatus

            for (const additionalCostProduct of orderAdditionalCost.products) {
              // Reload states from database for this product to get latest state
              // Find product states for this product that belong to the customer with base status
              // We need to process the exact quantity that was entered for this additional cost
              const statesForProduct = await productStateRepository.find({
                where: {
                  productId: additionalCostProduct.productId,
                  userId: orderWithAdditionalCosts.customerId,
                  location: ProductStateLocation.USER,
                  status: baseStatus
                },
                relations: ['product'],
                order: { createdAt: 'ASC' }
              })

              // Track how much quantity we need to process for this additional cost product
              let quantityToProcess = additionalCostProduct.quantity

              for (const state of statesForProduct) {
                if (quantityToProcess <= 0) {
                  break
                }

                // Skip if this state is already marked as calculationStatus
                if (calculationStatusStateIds.has(state.id)) {
                  continue
                }

                // For products with calculationStatus, keep them with the customer (location USER, holder customer)
                // Determine how much to process from this state
                const quantityFromState = Math.min(
                  state.quantity,
                  quantityToProcess
                )

                if (quantityFromState === state.quantity) {
                  // Update entire state to have calculationStatus, keep with customer (location USER, holder customer)
                  state.status = calculationStatus
                  state.location = ProductStateLocation.USER
                  state.userId = orderWithAdditionalCosts.customerId
                  state.serviceId = null // Clear serviceId when location is USER
                  state.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)

                  await productStateRepository.save(state)
                  calculationStatusStateIds.add(state.id) // Mark as calculationStatus state
                } else {
                  // Split: reduce this state's quantity and create new state with calculationStatus
                  state.quantity -= quantityFromState
                  await productStateRepository.save(state)
                  // Original state still has quantity and baseStatus, will be returned to service

                  // Create new state with calculationStatus for the customer (location USER, holder customer)
                  const newState = productStateRepository.create({
                    status: calculationStatus,
                    location: ProductStateLocation.USER,
                    quantity: quantityFromState,
                    productId: state.productId,
                    userId: orderWithAdditionalCosts.customerId,
                    serviceId: null, // No serviceId when location is USER
                    serviceLocationId: null // No serviceLocationId when location is USER (holder is user, not service)
                  })
                  const savedNewState = await productStateRepository.save(
                    newState
                  )
                  calculationStatusStateIds.add(savedNewState.id) // Mark new state as calculationStatus state
                }

                quantityToProcess -= quantityFromState
              }
            }
          }
        }

        // SECOND: Process products from order services
        // Reload states to get the latest state after processing additional costs
        // Find all product states that still belong to the customer with base status
        // Exclude any states that have calculationStatus (they should stay with customer)
        const remainingProductStates = await productStateRepository.find({
          where: {
            userId: orderWithAdditionalCosts.customerId,
            location: ProductStateLocation.USER,
            status: baseStatus
          },
          relations: ['product']
        })

        // Filter out calculationStatus states
        const statesToReturnToService = remainingProductStates.filter(
          (ps) => !calculationStatusStateIds.has(ps.id)
        )

        // Only return states with baseStatus that haven't been processed for calculationStatus
        const productStateMap = new Map<
          string,
          {
            productState: ProductState
            originalServiceLocationId: string | null
          }
        >()

        if (
          orderWithAdditionalCosts.services &&
          orderWithAdditionalCosts.services.length > 0
        ) {
          for (const orderService of orderWithAdditionalCosts.services) {
            if (
              !orderService.serviceLocationId ||
              !orderService.products ||
              orderService.products.length === 0
            ) {
              continue
            }

            for (const orderServiceProduct of orderService.products) {
              // Find product states for this product that belong to the customer with base status (IN_USE)
              // Exclude states that have calculationStatus (they should stay with customer)
              const statesForProduct = statesToReturnToService.filter(
                (ps) =>
                  ps.productId === orderServiceProduct.productId &&
                  ps.status === baseStatus &&
                  !productStateMap.has(ps.id)
              )

              // Sort to prioritize states with matching preserved serviceLocationId
              const sortedStates = statesForProduct.sort((a, b) => {
                const aMatches =
                  a.serviceLocationId === orderService.serviceLocationId ? 1 : 0
                const bMatches =
                  b.serviceLocationId === orderService.serviceLocationId ? 1 : 0
                return bMatches - aMatches
              })

              // Track how much quantity we need to return for this service product
              let quantityToReturn = orderServiceProduct.quantity

              for (const state of sortedStates) {
                if (quantityToReturn <= 0) {
                  break
                }

                // Use preserved serviceLocationId if available, otherwise use order service location
                const returnLocationId =
                  state.serviceLocationId || orderService.serviceLocationId

                if (!returnLocationId) {
                  continue // Skip if no service location to return to
                }

                // Determine how much to return from this state
                const quantityFromState = Math.min(
                  state.quantity,
                  quantityToReturn
                )

                if (!productStateMap.has(state.id)) {
                  if (quantityFromState === state.quantity) {
                    // Return entire state
                    productStateMap.set(state.id, {
                      productState: state,
                      originalServiceLocationId: returnLocationId
                    })
                  } else {
                    // Split: reduce this state's quantity and mark part for return
                    state.quantity -= quantityFromState
                    await productStateRepository.save(state)

                    // Create new state with AVAILABLE status for the returned quantity
                    // Holder should be service location (serviceLocationId set, userId null)
                    const returnedState = productStateRepository.create({
                      status: ProductStateStatus.AVAILABLE,
                      location: ProductStateLocation.SERVICE,
                      quantity: quantityFromState,
                      productId: state.productId,
                      serviceLocationId: returnLocationId,
                      serviceId: null, // Clear serviceId when location is SERVICE (holder is service location, not service)
                      userId: null // Clear userId when location is SERVICE (holder is service location, not user)
                    })
                    await productStateRepository.save(returnedState)
                  }

                  quantityToReturn -= quantityFromState
                }
              }
            }
          }
        }

        // Return products to their original service locations
        for (const [
          stateId,
          { productState, originalServiceLocationId }
        ] of productStateMap) {
          if (!originalServiceLocationId) {
            continue
          }

          // Defensive check: never process calculationStatus states
          if (calculationStatusStateIds.has(productState.id)) {
            continue
          }

          // Change status to AVAILABLE, location to SERVICE, and restore serviceLocationId
          // Holder should be service location (serviceLocationId set, userId null)
          productState.status = ProductStateStatus.AVAILABLE
          productState.location = ProductStateLocation.SERVICE
          productState.serviceLocationId = originalServiceLocationId
          productState.serviceId = null // Clear serviceId when location is SERVICE (holder is service location, not service)
          productState.userId = null // Clear userId when location is SERVICE (holder is service location, not user)

          await productStateRepository.save(productState)
        }

        // Final verification: Ensure all calculationStatus states are correct
        // Reload and fix any calculationStatus states that might have been incorrectly modified
        if (calculationStatusStateIds.size > 0) {
          const calculationStatusStates = await productStateRepository.find({
            where: {
              id: In(Array.from(calculationStatusStateIds)),
              userId: orderWithAdditionalCosts.customerId
            }
          })

          for (const state of calculationStatusStates) {
            // Ensure calculationStatus states are location USER with customer as holder
            if (
              state.location !== ProductStateLocation.USER ||
              state.userId !== orderWithAdditionalCosts.customerId ||
              state.serviceLocationId !== null ||
              state.serviceId !== null
            ) {
              state.location = ProductStateLocation.USER
              state.userId = orderWithAdditionalCosts.customerId
              state.serviceId = null
              state.serviceLocationId = null
              await productStateRepository.save(state)
            }
          }
        }
      }

      // Handle product state updates when status changes to COMPLETED
      // Return products from user back to order's service location with AVAILABLE status (for RENT orders only)
      if (
        status === OrderStatus.COMPLETED &&
        previousStatus !== OrderStatus.COMPLETED &&
        orderWithAdditionalCosts &&
        orderWithAdditionalCosts.customerId &&
        orderWithAdditionalCosts.acquisitionType === AcquisitionType.RENT &&
        orderWithAdditionalCosts.serviceLocationId
      ) {
        // Collect all product IDs and quantities from this order
        const orderProductMap = new Map<string, number>()

        // Collect products from direct order products
        if (
          orderWithAdditionalCosts.products &&
          orderWithAdditionalCosts.products.length > 0
        ) {
          for (const orderProduct of orderWithAdditionalCosts.products) {
            const currentQuantity =
              orderProductMap.get(orderProduct.productId) || 0
            orderProductMap.set(
              orderProduct.productId,
              currentQuantity + orderProduct.quantity
            )
          }
        }

        // Collect products from order services
        if (
          orderWithAdditionalCosts.services &&
          orderWithAdditionalCosts.services.length > 0
        ) {
          for (const orderService of orderWithAdditionalCosts.services) {
            if (orderService.products && orderService.products.length > 0) {
              for (const orderServiceProduct of orderService.products) {
                const currentQuantity =
                  orderProductMap.get(orderServiceProduct.productId) || 0
                orderProductMap.set(
                  orderServiceProduct.productId,
                  currentQuantity + orderServiceProduct.quantity
                )
              }
            }
          }
        }

        // Find all product states that are IN_USE and belong to this order's customer
        // Only for products that are in this order
        if (orderProductMap.size > 0) {
          const orderProductIds = Array.from(orderProductMap.keys())
          const productStatesToReturn = await productStateRepository.find({
            where: {
              userId: orderWithAdditionalCosts.customerId,
              location: ProductStateLocation.USER,
              status: ProductStateStatus.IN_USE,
              productId: In(orderProductIds)
            },
            relations: ['product'],
            order: { createdAt: 'ASC' }
          })

          // Track quantities to return per product
          const quantitiesToReturn = new Map<string, number>(
            Array.from(orderProductMap.entries())
          )

          // Return products to the order's service location
          for (const productState of productStatesToReturn) {
            const remainingQuantity =
              quantitiesToReturn.get(productState.productId) || 0

            if (remainingQuantity <= 0) {
              continue
            }

            const quantityToReturn = Math.min(
              productState.quantity,
              remainingQuantity
            )

            if (quantityToReturn === productState.quantity) {
              // Return entire state
              productState.status = ProductStateStatus.AVAILABLE
              productState.location = ProductStateLocation.SERVICE
              productState.serviceLocationId =
                orderWithAdditionalCosts.serviceLocationId
              productState.serviceId = null // Clear serviceId when location is SERVICE (holder is service location, not service)
              productState.userId = null // Clear userId when location is SERVICE (holder is service location, not user)

              await productStateRepository.save(productState)
              quantitiesToReturn.set(
                productState.productId,
                remainingQuantity - quantityToReturn
              )
            } else {
              // Split: reduce this state's quantity and create new state for returned quantity
              productState.quantity -= quantityToReturn
              await productStateRepository.save(productState)

              // Create new state with AVAILABLE status for the returned quantity
              const returnedState = productStateRepository.create({
                status: ProductStateStatus.AVAILABLE,
                location: ProductStateLocation.SERVICE,
                quantity: quantityToReturn,
                productId: productState.productId,
                serviceLocationId: orderWithAdditionalCosts.serviceLocationId,
                serviceId: null, // Clear serviceId when location is SERVICE (holder is service location, not service)
                userId: null // Clear userId when location is SERVICE (holder is service location, not user)
              })
              await productStateRepository.save(returnedState)
              quantitiesToReturn.set(
                productState.productId,
                remainingQuantity - quantityToReturn
              )
            }
          }
        }
      }

      // Handle product state updates when status changes to COMPLETED
      // For BUY orders: Change status to AVAILABLE, location is USER unless service has serviceLocationId
      if (
        status === OrderStatus.COMPLETED &&
        previousStatus !== OrderStatus.COMPLETED &&
        orderWithAdditionalCosts &&
        orderWithAdditionalCosts.customerId &&
        orderWithAdditionalCosts.acquisitionType === AcquisitionType.BUY
      ) {
        // Find if any service has a serviceLocationId
        let targetServiceLocationId: string | null = null
        if (
          orderWithAdditionalCosts.services &&
          orderWithAdditionalCosts.services.length > 0
        ) {
          // Find the first service with a serviceLocationId
          for (const orderService of orderWithAdditionalCosts.services) {
            if (orderService.serviceLocationId) {
              targetServiceLocationId = orderService.serviceLocationId
              break
            }
          }
        }

        // Collect total quantity from order
        let totalQuantity = 0

        // Collect products from direct order products
        if (
          orderWithAdditionalCosts.products &&
          orderWithAdditionalCosts.products.length > 0
        ) {
          for (const orderProduct of orderWithAdditionalCosts.products) {
            totalQuantity += orderProduct.quantity
          }
        }

        // Collect products from order services
        if (
          orderWithAdditionalCosts.services &&
          orderWithAdditionalCosts.services.length > 0
        ) {
          for (const orderService of orderWithAdditionalCosts.services) {
            if (orderService.products && orderService.products.length > 0) {
              for (const orderServiceProduct of orderService.products) {
                totalQuantity += orderServiceProduct.quantity
              }
            }
          }
        }

        // Find all IN_USE product states for this customer
        // For BUY orders, products are copied and ownedBy is set to customerId
        // We need to find product states for products owned by this customer (newest first)
        if (totalQuantity > 0) {
          const productRepository = manager.getRepository(Product)

          // First, find all products owned by this customer (the copied products)
          const customerProducts = await productRepository.find({
            where: {
              ownedBy: orderWithAdditionalCosts.customerId
            },
            order: { createdAt: 'DESC' } // Newest first
          })

          const customerProductIds = customerProducts.map((p) => p.id)

          if (customerProductIds.length > 0) {
            // Find product states for these customer-owned products that are IN_USE
            const productStatesToUpdate = await productStateRepository.find({
              where: {
                productId: In(customerProductIds),
                userId: orderWithAdditionalCosts.customerId,
                location: ProductStateLocation.USER,
                status: ProductStateStatus.IN_USE
              },
              relations: ['product'],
              order: { createdAt: 'DESC' } // Newest first - get the most recently created products
            })

            // Update products: change status to AVAILABLE
            // If serviceLocationId exists, move to SERVICE location, otherwise keep USER location
            let remainingQuantity = totalQuantity

            for (const productState of productStatesToUpdate) {
              if (remainingQuantity <= 0) {
                break
              }

              const quantityToUpdate = Math.min(
                productState.quantity,
                remainingQuantity
              )

              if (quantityToUpdate === productState.quantity) {
                // Update entire state
                productState.status = ProductStateStatus.AVAILABLE

                if (targetServiceLocationId) {
                  // Move to service location
                  productState.location = ProductStateLocation.SERVICE
                  productState.serviceLocationId = targetServiceLocationId
                  productState.serviceId = null
                  productState.userId = null
                } else {
                  // Keep with user
                  productState.location = ProductStateLocation.USER
                  productState.userId = orderWithAdditionalCosts.customerId
                  productState.serviceId = null
                  productState.serviceLocationId = null
                }

                await productStateRepository.save(productState)
                remainingQuantity -= quantityToUpdate
              } else {
                // Split: reduce this state's quantity and create new state
                productState.quantity -= quantityToUpdate
                await productStateRepository.save(productState)

                // Create new state with AVAILABLE status
                const newState = productStateRepository.create({
                  status: ProductStateStatus.AVAILABLE,
                  location: targetServiceLocationId
                    ? ProductStateLocation.SERVICE
                    : ProductStateLocation.USER,
                  quantity: quantityToUpdate,
                  productId: productState.productId,
                  serviceLocationId: targetServiceLocationId,
                  serviceId: null,
                  userId: targetServiceLocationId
                    ? null
                    : orderWithAdditionalCosts.customerId
                })
                await productStateRepository.save(newState)
                remainingQuantity -= quantityToUpdate
              }
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

  /**
   * Copy a product with all its related data (images, prices, service prices, design template)
   * and set ownedBy to the customer ID
   * Always creates a new copy - does not check for existing copies
   */
  private async copyProductForPurchase(
    originalProductId: string,
    customerId: string,
    manager = AppDataSource.manager
  ): Promise<string> {
    try {
      const productRepository = manager.getRepository(Product)
      const productMediaRepository = manager.getRepository(ProductMedia)
      const productPriceRepository = manager.getRepository(ProductPrice)
      const productServicePriceRepository =
        manager.getRepository(ProductServicePrice)

      // Load the original product with all relations
      const originalProduct = await productRepository.findOne({
        where: { id: originalProductId },
        relations: ['images', 'prices', 'designTemplate']
      })

      if (!originalProduct) {
        logger.error({
          message: `Product with id ${originalProductId} not found`,
          originalProductId,
          customerId
        })
        throw new Error(`Product with id ${originalProductId} not found`)
      }

      // Always create a new product copy for each purchase
      // Create a new product copy
      const productCopy = productRepository.create({
        name: originalProduct.name,
        size: originalProduct.size,
        unit: originalProduct.unit,
        quantityPerUnit: originalProduct.quantityPerUnit,
        transportationUnit: originalProduct.transportationUnit,
        unitsPerTransportationUnit: originalProduct.unitsPerTransportationUnit,
        description: originalProduct.description,
        acquisitionType: originalProduct.acquisitionType,
        status: originalProduct.status,
        designTemplateId: originalProduct.designTemplateId,
        ownedBy: customerId
      })

      const savedProductCopy = await productRepository.save(productCopy)

      logger.info({
        message: `Created product copy for purchase`,
        originalProductId,
        copiedProductId: savedProductCopy.id,
        customerId
      })

      // Copy images
      if (originalProduct.images && originalProduct.images.length > 0) {
        const imageCopies = originalProduct.images.map((img) =>
          productMediaRepository.create({
            productId: savedProductCopy.id,
            mediaId: img.mediaId
          })
        )
        await productMediaRepository.save(imageCopies)
        logger.info({
          message: `Copied ${imageCopies.length} images for product copy`,
          copiedProductId: savedProductCopy.id
        })
      }

      // Copy prices
      if (originalProduct.prices && originalProduct.prices.length > 0) {
        const priceCopies = originalProduct.prices.map((price) =>
          productPriceRepository.create({
            productId: savedProductCopy.id,
            minQuantity: price.minQuantity,
            maxQuantity: price.maxQuantity,
            price: price.price
          })
        )
        await productPriceRepository.save(priceCopies)
        logger.info({
          message: `Copied ${priceCopies.length} prices for product copy`,
          copiedProductId: savedProductCopy.id
        })
      }

      // Copy service prices
      const originalServicePrices = await productServicePriceRepository.find({
        where: { productId: originalProductId }
      })
      if (originalServicePrices.length > 0) {
        const servicePriceCopies = originalServicePrices.map((sp) =>
          productServicePriceRepository.create({
            productId: savedProductCopy.id,
            serviceId: sp.serviceId,
            minQuantity: sp.minQuantity,
            maxQuantity: sp.maxQuantity,
            price: sp.price
          })
        )
        await productServicePriceRepository.save(servicePriceCopies)
        logger.info({
          message: `Copied ${servicePriceCopies.length} service prices for product copy`,
          copiedProductId: savedProductCopy.id
        })
      }

      return savedProductCopy.id
    } catch (err: any) {
      logger.error({
        message: `Error copying product for purchase`,
        originalProductId,
        customerId,
        error: err.message,
        stack: err.stack
      })
      throw err
    }
  }

  /**
   * Process a product for an order when status changes to IN_PRODUCTION
   * - If there are available products in the service location, transfer them to IN_USE status
   * - If there are not enough available products, create new ones with the target status
   * - Preserves original serviceLocationId so products can be returned later
   */
  private async processProductForOrder(
    productId: string,
    quantityNeeded: number,
    serviceLocationId: string | null,
    customerId: string,
    targetStatus: ProductStateStatus,
    manager = AppDataSource.manager
  ): Promise<void> {
    const productStateRepository = manager.getRepository(ProductState)

    // Check if products have already been assigned to this user for this product with the target status
    // This prevents duplicate assignments if the method is called multiple times
    // Consolidate all existing states for this product/user/status combination into one
    const existingAssignedStates = await productStateRepository.find({
      where: {
        productId,
        userId: customerId,
        location: ProductStateLocation.USER,
        status: targetStatus
      },
      order: { createdAt: 'ASC' } // Use oldest first
    })

    // Consolidate all existing states into one if there are multiple
    let existingStateToUpdate: ProductState | null = null
    if (existingAssignedStates.length > 0) {
      existingStateToUpdate = existingAssignedStates[0]
      // Ensure userId is set to customer (holder) and serviceId/serviceLocationId are null
      existingStateToUpdate.userId = customerId
      existingStateToUpdate.location = ProductStateLocation.USER
      existingStateToUpdate.serviceId = null // Clear serviceId when location is USER
      existingStateToUpdate.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
      // If there are multiple existing states, consolidate them into the first one
      if (existingAssignedStates.length > 1) {
        const totalQuantity = existingAssignedStates.reduce(
          (sum, state) => sum + state.quantity,
          0
        )
        existingStateToUpdate.quantity = totalQuantity
        // Preserve the serviceLocationId from the first state (or merge logic could be improved)
        // For now, we'll use the first state's serviceLocationId
        await productStateRepository.save(existingStateToUpdate)

        // Delete the other duplicate states
        const statesToDelete = existingAssignedStates.slice(1)
        await productStateRepository.remove(statesToDelete)
      }
    }

    // If no service location, we can't check for available products
    // In this case, create ONE new product state with target status and total quantity
    // If user already has this product, update existing state quantity instead
    if (!serviceLocationId) {
      if (existingStateToUpdate) {
        // User already has this product, just increase quantity
        // Ensure userId is set to customer (holder) and serviceId/serviceLocationId are null
        existingStateToUpdate.userId = customerId
        existingStateToUpdate.location = ProductStateLocation.USER
        existingStateToUpdate.serviceId = null // Clear serviceId when location is USER
        existingStateToUpdate.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
        existingStateToUpdate.quantity += quantityNeeded
        await productStateRepository.save(existingStateToUpdate)
      } else {
        // User doesn't have this product yet, create ONE state with total quantity
        const newProductState = productStateRepository.create({
          status: targetStatus,
          location: ProductStateLocation.USER,
          quantity: quantityNeeded,
          productId,
          userId: customerId,
          serviceId: null, // No serviceId when location is USER
          serviceLocationId: null // No original service location
        })
        await productStateRepository.save(newProductState)
        existingStateToUpdate = newProductState // Track for potential future updates
      }
      return
    }

    // Find available products in the service location
    const availableProductStates = await productStateRepository.find({
      where: {
        productId,
        status: ProductStateStatus.AVAILABLE,
        location: ProductStateLocation.SERVICE,
        serviceLocationId
      },
      order: { createdAt: 'ASC' } // Use oldest first
    })

    // Calculate total available quantity
    const totalAvailable = availableProductStates.reduce(
      (sum, state) => sum + state.quantity,
      0
    )

    let remainingNeeded = quantityNeeded

    // Transfer available products to IN_USE status
    // Preserve original serviceLocationId so we can return products later
    if (totalAvailable > 0 && remainingNeeded > 0) {
      for (const productState of availableProductStates) {
        if (remainingNeeded <= 0) {
          break
        }

        const quantityToTransfer = Math.min(
          productState.quantity,
          remainingNeeded
        )
        const originalServiceLocationId = productState.serviceLocationId

        if (quantityToTransfer === productState.quantity) {
          // If user already has this product, update existing state quantity
          // Otherwise, transfer entire state to target status with USER location
          // Preserve serviceLocationId for later return
          if (existingStateToUpdate) {
            // User already has this product, just increase quantity
            // Ensure userId is set to customer (holder) and serviceId/serviceLocationId are null
            existingStateToUpdate.userId = customerId
            existingStateToUpdate.location = ProductStateLocation.USER
            existingStateToUpdate.serviceId = null // Clear serviceId when location is USER
            existingStateToUpdate.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
            existingStateToUpdate.quantity += quantityToTransfer
            await productStateRepository.save(existingStateToUpdate)
            // Delete the transferred state since we're consolidating
            await productStateRepository.remove(productState)
          } else {
            // User doesn't have this product yet, transfer state
            productState.status = targetStatus
            productState.location = ProductStateLocation.USER
            productState.userId = customerId
            productState.serviceId = null // Clear serviceId when location is USER
            productState.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
            await productStateRepository.save(productState)
            existingStateToUpdate = productState // Track this as the state to update
          }
          remainingNeeded -= quantityToTransfer
        } else {
          // Split the state: keep some as available, transfer some to target status
          // Update existing state to reduce quantity
          productState.quantity -= quantityToTransfer
          await productStateRepository.save(productState)

          // If user already has this product, update existing state quantity
          // Otherwise, create new state with target status
          // Preserve serviceLocationId for later return
          if (existingStateToUpdate) {
            // Ensure userId is set to customer (holder) and serviceId/serviceLocationId are null
            existingStateToUpdate.userId = customerId
            existingStateToUpdate.location = ProductStateLocation.USER
            existingStateToUpdate.serviceId = null // Clear serviceId when location is USER
            existingStateToUpdate.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
            existingStateToUpdate.quantity += quantityToTransfer
            await productStateRepository.save(existingStateToUpdate)
          } else {
            const newState = productStateRepository.create({
              status: targetStatus,
              location: ProductStateLocation.USER,
              quantity: quantityToTransfer,
              productId,
              userId: customerId,
              serviceId: null, // No serviceId when location is USER
              serviceLocationId: null // No serviceLocationId when location is USER (holder is user, not service)
            })
            await productStateRepository.save(newState)
            existingStateToUpdate = newState // Track this as the state to update
          }

          remainingNeeded -= quantityToTransfer
        }
      }
    }

    // If still need more products, create ONE new state with target status and remaining quantity
    // If user already has this product, update existing state quantity instead
    if (remainingNeeded > 0) {
      if (existingStateToUpdate) {
        // User already has this product, just increase quantity
        // Ensure userId is set to customer (holder) and serviceId/serviceLocationId are null
        existingStateToUpdate.userId = customerId
        existingStateToUpdate.location = ProductStateLocation.USER
        existingStateToUpdate.serviceId = null // Clear serviceId when location is USER
        existingStateToUpdate.serviceLocationId = null // Clear serviceLocationId when location is USER (holder is user, not service)
        existingStateToUpdate.quantity += remainingNeeded
        await productStateRepository.save(existingStateToUpdate)
      } else {
        // User doesn't have this product yet, create ONE state with remaining quantity
        const newProductState = productStateRepository.create({
          status: targetStatus,
          location: ProductStateLocation.USER,
          quantity: remainingNeeded,
          productId,
          userId: customerId,
          serviceId: null, // No serviceId when location is USER
          serviceLocationId: null // No serviceLocationId when location is USER (holder is user, not service)
        })
        await productStateRepository.save(newProductState)
      }
    }
  }
}
