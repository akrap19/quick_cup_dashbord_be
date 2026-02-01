import { AsyncResponse, IServiceMethod } from '../../interface'
import { AcquisitionType } from '../products/interface'
import { Order } from './ordersModel'

export interface IOrderProductInput {
  productId: string
  quantity: number
  price: number
}

export interface IOrderServiceProductInput {
  productId: string
  quantity: number
}

export interface IOrderServiceInput {
  serviceId: string
  quantity: number
  price: number
  serviceLocationId?: string | null
  quantityByProduct?: IOrderServiceProductInput[]
}

export interface IOrderAdditionalCostProductInput {
  productId: string
  quantity: number
  fileId?: string | null
}

export interface IOrderAdditionalCostInput {
  additionalCostId: string
  price: number
  quantity?: number | null
  quantityByProduct?: IOrderAdditionalCostProductInput[]
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
  discount?: number | null
  products?: IOrderProductInput[]
  services?: IOrderServiceInput[]
  additionalCosts?: IOrderAdditionalCostInput[]
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
  discount?: number | null
  products?: IOrderProductInput[]
  services?: IOrderServiceInput[]
  additionalCosts?: IOrderAdditionalCostInput[]
}

export interface IDeleteOrder extends IServiceMethod {
  orderId: string
}

export interface IGetOrderById extends IServiceMethod {
  orderId: string
  customerId?: string | null
}

export interface IListOrders extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  status?: string | null
  customerId?: string | null
  serviceUserId?: string | null
}

export interface IUpdateOrderStatus extends IServiceMethod {
  orderId: string
  status: string
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
  updateOrderStatus(params: IUpdateOrderStatus): AsyncResponse<Order>
  deleteOrder(params: IDeleteOrder): AsyncResponse<null>
}
