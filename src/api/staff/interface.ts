import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'

export interface IStaffPagination {
  staff: IStaffLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IStaffLimited {
  staffId: string
  barnahusId: string
}

export interface IStaffImageLimited {
  staffImageId: string
  mediaId: string
  url: string
}

export interface ICreateStaff extends IServiceMethod {
  barnahusId: string
  name: string
}

export interface IAddStaffImages extends IServiceMethod {
  images: {
    staffId: string
    mediaId: string
  }[]
}

export interface IGetStaffImages {
  staffId: string
  signUrl?: boolean
}

export interface IDeleteStaffImage {
  staffImageId: string
}

export interface IDeleteStaff extends IServiceMethod {
  staffId: string
}

export interface IBulkDeleteStaff {
  staffIds: Array<string>
}

export interface IEditStaff extends IServiceMethod {
  staffId: string
  name: string
}

export interface IGetStaff {
  barnahusId: string
  page: number
  limit: number
}

export interface IRemoveUnusedStaff {
  barnahusId: string
}

export interface IStaffService {
  createStaff(params: ICreateStaff): AsyncResponse<string>
  addStaffImages(params: IAddStaffImages): AsyncResponse<null>
  getStaffImages(params: IGetStaffImages): AsyncResponse<IStaffImageLimited[]>
  deleteStaffImage(params: IDeleteStaffImage): AsyncResponse<null>
  deleteStaff(params: IDeleteStaff): AsyncResponse<null>
  bulkDeleteStaff(params: IBulkDeleteStaff): AsyncResponse<null>
  editStaff(params: IEditStaff): AsyncResponse<null>
  getStaff(params: IGetStaff): AsyncResponse<IStaffPagination>
  removeUnusedStaff(params: IRemoveUnusedStaff): AsyncResponse<null>
}
