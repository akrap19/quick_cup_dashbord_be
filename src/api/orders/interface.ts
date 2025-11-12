import { AsyncResponse, IServiceMethod } from '../../interface'
import { Order } from './ordersModel'

export interface ICreateOrder extends IServiceMethod {
  orderNumber: string
  status: string
  totalAmount: number
  customerName?: string | null
  notes?: string | null
}

export interface IUpdateOrder extends IServiceMethod {
  orderId: string
  orderNumber?: string
  status?: string
  totalAmount?: number
  customerName?: string | null
  notes?: string | null
}

export interface IDeleteOrder extends IServiceMethod {
  orderId: string
}

export interface IGetOrderById extends IServiceMethod {
  orderId: string
}

export interface IListOrders extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  status?: string | null
}

export interface IOrdersPagination {
  orders: Order[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IOrderService {
  listOrders(params: IListOrders): AsyncResponse<IOrdersPagination>
  getOrderById(params: IGetOrderById): AsyncResponse<Order>
  createOrder(params: ICreateOrder): AsyncResponse<Order>
  updateOrder(params: IUpdateOrder): AsyncResponse<Order>
  deleteOrder(params: IDeleteOrder): AsyncResponse<null>
}
