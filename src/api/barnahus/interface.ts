import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { Barnahus } from './barnahusModel'

export interface ISearchPlacesResult {
  id: string
  name: string
  locationCode: string
}

export interface ICreateBarnahus {
  name: string
  location: string
  userId?: string
  assignedById?: string
}

export interface IGetBarnahusById {
  barnahusId: string
}

export interface IBarnahusLimited {
  barnahusId: string
  name: string
  location: string
  locationCode: string
  admin: string | null
}

export interface IBarnahusesPaginationLimited {
  barnahuses: IBarnahusLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IBarnahusesPagination {
  barnahuses: Barnahus[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IGetBarnahuses {
  search: string | null
  page: number
  limit: number
}

export interface IGetAssignableBarnahuses {
  search: string
}

export interface IGetMasterAdminsBarnahus {
  id: string
}

export interface IEditBarnahus {
  barnahusId: string
  name: string
  location: string
  adminId: string
  assignedById: string
}

export interface IDeleteBarnahus extends IServiceMethod {
  barnahusId: string
}

export interface IBulkDeleteBarnahuses {
  barnahusIds: Array<string>
}

export interface ISearchBarnahusLocations {
  search: string
}

export interface IGenerateLocationCode extends IServiceMethod {
  location: string
}

export interface IGetBarnahusByLocationCode {
  locationCode: string
}

export interface IBarnahusService {
  createBarnahus(params: ICreateBarnahus): AsyncResponse<ResponseCode>
  getBarnahusById(params: IGetBarnahusById): AsyncResponse<Barnahus>
  getBarnahusByLocationCode(
    params: IGetBarnahusByLocationCode
  ): AsyncResponse<Barnahus>
  getBarnahuses(params: IGetBarnahuses): AsyncResponse<IBarnahusesPagination>
  getAssignableBarnahuses(
    params: IGetAssignableBarnahuses
  ): AsyncResponse<Barnahus[]>
  deleteBarnahus(params: IDeleteBarnahus): AsyncResponse<ResponseCode>
  bulkDeleteBarnahuses(
    params: IBulkDeleteBarnahuses
  ): AsyncResponse<ResponseCode>
  editBarnahus(params: IEditBarnahus): AsyncResponse<ResponseCode>
  searchBarnahusLocations(
    params: ISearchBarnahusLocations
  ): AsyncResponse<ISearchPlacesResult[]>
  getBarnahusLocations(): AsyncResponse<any>
  generateLocationCode(params: IGenerateLocationCode): AsyncResponse<string>
}
