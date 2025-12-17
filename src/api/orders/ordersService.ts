import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { AcquisitionType } from '../products/interface'
import {
  ICreateOrder,
  IDeleteOrder,
  IGetOrderById,
  IListOrders,
  IOrderService,
  IOrdersPagination,
  IUpdateOrder
} from './interface'
import { Order } from './ordersModel'
import { OrderProduct } from './orderProductModel'
import { OrderService } from './orderServiceModel'

type ListOrdersResponse = Awaited<AsyncResponse<IOrdersPagination>>
type OrderResponse = Awaited<AsyncResponse<Order>>
type DeleteOrderResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class OrdersService implements IOrderService {
  private readonly orderRepository: Repository<Order>
  private readonly orderProductRepository: Repository<OrderProduct>
  private readonly orderServiceRepository: Repository<OrderService>

  constructor() {
    this.orderRepository = AppDataSource.manager.getRepository(Order)
    this.orderProductRepository =
      AppDataSource.manager.getRepository(OrderProduct)
    this.orderServiceRepository =
      AppDataSource.manager.getRepository(OrderService)
  }

  /**
   * Generates an order number in format: qc-ddmmyy0000001
   * Where ddmmyy is the current date and 0000001 is a 7-digit sequential number
   */
  private async generateOrderNumber(
    manager = AppDataSource.manager
  ): Promise<string> {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    const datePrefix = `${day}${month}${year}`

    // Get the start and end of today
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const orderRepository = manager.getRepository(Order)

    // Find the maximum sequential number for today
    const orders = await orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :startOfDay', { startOfDay })
      .andWhere('order.createdAt <= :endOfDay', { endOfDay })
      .andWhere('order.orderNumber LIKE :pattern', {
        pattern: `qc-${datePrefix}%`
      })
      .orderBy('order.orderNumber', 'DESC')
      .limit(1)
      .getOne()

    let sequentialNumber = 1

    if (orders && orders.orderNumber) {
      // Extract the sequential number from the last order number
      // Format: qc-ddmmyy0000001, so we need to extract the last 7 digits
      const match = orders.orderNumber.match(/qc-\d{6}(\d{7})$/)
      if (match) {
        const lastNumber = parseInt(match[1], 10)
        sequentialNumber = lastNumber + 1
      }
    }

    // Generate sequential number with 7 digits, padded with zeros
    const sequentialNumberStr = sequentialNumber.toString().padStart(7, '0')

    return `qc-${datePrefix}${sequentialNumberStr}`
  }

  listOrders = async ({
    search,
    page = 1,
    limit = 25,
    status,
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
        .orderBy('order.placedAt', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        orders,
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
    queryRunner
  }: IGetOrderById): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const order = await repository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .leftJoinAndSelect('order.services', 'services')
        .leftJoinAndSelect('services.service', 'service')
        .where('order.id = :orderId', { orderId })
        .getOne()

      if (!order) {
        return { code: ResponseCode.NOT_FOUND }
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
    queryRunner
  }: ICreateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const orderRepository = manager.getRepository(Order)
      const orderProductRepository = manager.getRepository(OrderProduct)
      const orderServiceRepository = manager.getRepository(OrderService)

      // Generate order number automatically
      const orderNumber = await this.generateOrderNumber(manager)

      const order = orderRepository.create({
        orderNumber,
        status: 'Order Created',
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
            price: service.price
          })
        )
        await orderServiceRepository.save(orderServices)
      }

      // Reload order with relationships
      const orderWithRelations = await orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.event', 'event')
        .leftJoinAndSelect('order.products', 'products')
        .leftJoinAndSelect('products.product', 'product')
        .leftJoinAndSelect('order.services', 'services')
        .leftJoinAndSelect('services.service', 'service')
        .where('order.id = :orderId', { orderId: savedOrder.id })
        .getOne()

      return {
        order: orderWithRelations || savedOrder,
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
    queryRunner
  }: IUpdateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const manager = queryRunner ? queryRunner.manager : AppDataSource.manager

      const orderRepository = manager.getRepository(Order)
      const orderProductRepository = manager.getRepository(OrderProduct)
      const orderServiceRepository = manager.getRepository(OrderService)

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
        // Delete existing services
        await orderServiceRepository.delete({ orderId })

        // Create new services
        if (services && services.length > 0) {
          const orderServices = services.map((service) =>
            orderServiceRepository.create({
              orderId,
              serviceId: service.serviceId,
              quantity: service.quantity,
              price: service.price
            })
          )
          await orderServiceRepository.save(orderServices)
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
}
