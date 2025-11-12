import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
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

type ListOrdersResponse = Awaited<AsyncResponse<IOrdersPagination>>
type OrderResponse = Awaited<AsyncResponse<Order>>
type DeleteOrderResponse = Awaited<AsyncResponse<null>>

@autoInjectable()
export class OrdersService implements IOrderService {
  private readonly orderRepository: Repository<Order>

  constructor() {
    this.orderRepository = AppDataSource.manager.getRepository(Order)
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
        query.andWhere(
          'LOWER(order.orderNumber) LIKE :searchLike OR LOWER(order.customerName) LIKE :searchLike',
          { searchLike }
        )
      }

      const offset = (currentPage - 1) * currentLimit

      const [orders, count] = await query
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

      const order = await repository.findOne({ where: { id: orderId } })

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
    orderNumber,
    status,
    totalAmount,
    customerName,
    notes,
    queryRunner
  }: ICreateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const order = repository.create({
        orderNumber,
        status,
        totalAmount,
        customerName: customerName ?? null,
        notes: notes ?? null
      })

      const savedOrder = await repository.save(order)

      return { order: savedOrder, code } as unknown as OrderResponse
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
    orderNumber,
    status,
    totalAmount,
    customerName,
    notes,
    queryRunner
  }: IUpdateOrder): AsyncResponse<Order> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(Order)
        : this.orderRepository

      const updateData: Partial<Order> = {}

      if (typeof orderNumber !== 'undefined') {
        updateData.orderNumber = orderNumber
      }
      if (typeof status !== 'undefined') {
        updateData.status = status
      }
      if (typeof totalAmount !== 'undefined') {
        updateData.totalAmount = totalAmount
      }
      if (typeof customerName !== 'undefined') {
        updateData.customerName = customerName ?? null
      }
      if (typeof notes !== 'undefined') {
        updateData.notes = notes ?? null
      }

      const result = await repository
        .createQueryBuilder()
        .update(Order)
        .set(updateData)
        .where('id = :orderId', { orderId })
        .execute()

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

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
