import { AsyncResponse, IServiceMethod } from '../../interface'
import { AcquisitionType } from '../products/interface'
import { ProductStateStatus } from '../product_state/interface'
import { AdditionalCost } from './additionalCostModel'

export enum MethodOfPayment {
  BEFORE = 'before',
  AFTER = 'after'
}

export enum BillingType {
  BY_PIECE = 'by_piece',
  ONE_TIME = 'one_time'
}

export interface ICreateAdditionalCost extends IServiceMethod {
  name: string
  methodOfPayment: MethodOfPayment
  billingType: BillingType
  acquisitionType: AcquisitionType
  price: number
  calculationStatus?: ProductStateStatus | null
  maxPieces?: number | null
  enableUpload?: boolean
}

export interface IUpdateAdditionalCost extends IServiceMethod {
  additionalCostId: string
  name?: string
  methodOfPayment?: MethodOfPayment
  billingType?: BillingType
  acquisitionType?: AcquisitionType
  price?: number
  calculationStatus?: ProductStateStatus | null
  maxPieces?: number | null
  enableUpload?: boolean
}

export interface IGetAdditionalCostById extends IServiceMethod {
  additionalCostId: string
}

export interface IListAdditionalCosts extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  methodOfPayment?: MethodOfPayment | null
  billingType?: BillingType | null
  acquisitionType?: AcquisitionType | null
}

export interface IDeleteAdditionalCost extends IServiceMethod {
  additionalCostId: string
}

export interface IAdditionalCostsPagination {
  additionalCosts: AdditionalCost[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IAdditionalCostService {
  listAdditionalCosts(
    params: IListAdditionalCosts
  ): AsyncResponse<IAdditionalCostsPagination>
  getAdditionalCostById(
    params: IGetAdditionalCostById
  ): AsyncResponse<AdditionalCost>
  createAdditionalCost(
    params: ICreateAdditionalCost
  ): AsyncResponse<AdditionalCost>
  updateAdditionalCost(
    params: IUpdateAdditionalCost
  ): AsyncResponse<AdditionalCost>
  deleteAdditionalCost(params: IDeleteAdditionalCost): AsyncResponse<null>
}
