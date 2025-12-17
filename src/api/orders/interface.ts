import { AsyncResponse, IServiceMethod } from '../../interface'
import { AcquisitionType } from '../products/interface'
import { Order } from './ordersModel'

export interface IOrderProductInput {
  productId: string
  quantity: number
  price: number
}

export interface IOrderServiceInput {
  serviceId: string
  quantity: number
  price: number
}

export interface ICreateOrder extends IServiceMethod {
  totalAmount: number
  notes?: string | null
  acquisitionType?: AcquisitionType
  customerId?: string | null
  eventId?: string | null
  location?: string | null
  place?: string | null
  street?: string | null
  contactPerson?: string | null
  contactPersonContact?: string | null
  products?: IOrderProductInput[]
  services?: IOrderServiceInput[]
}

export interface IUpdateOrder extends IServiceMethod {
  orderId: string
  status?: string
  totalAmount?: number
  notes?: string | null
  acquisitionType?: AcquisitionType
  customerId?: string | null
  eventId?: string | null
  location?: string | null
  place?: string | null
  street?: string | null
  contactPerson?: string | null
  contactPersonContact?: string | null
  products?: IOrderProductInput[]
  services?: IOrderServiceInput[]
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
