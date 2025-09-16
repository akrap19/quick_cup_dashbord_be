import { AsyncResponse, IServiceMethod } from '../../interface'

export interface IAboutsPagination {
  abouts: IAboutLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IAboutLimited {
  aboutId: string
  barnahusId: string
}

export interface IAboutImageLimited {
  aboutImageId: string
  mediaId: string
  url: string
}

export interface ICreateAbout extends IServiceMethod {
  barnahusId: string
}

export interface IAddAboutImages extends IServiceMethod {
  images: {
    aboutId: string
    mediaId: string
  }[]
}

export interface IGetAboutImages {
  aboutId: string
  signUrl?: boolean
}

export interface IDeleteAboutImage {
  aboutImageId: string
}

export interface IDeleteAbout extends IServiceMethod {
  aboutId: string
}

export interface IBulkDeleteAbouts {
  aboutIds: Array<string>
}

export interface IGetAbouts {
  barnahusId: string
  page: number
  limit: number
}

export interface IRemoveUnusedAbouts {
  barnahusId: string
}

export interface IAboutService {
  createAbout(params: ICreateAbout): AsyncResponse<string>
  addAboutImages(params: IAddAboutImages): AsyncResponse<null>
  getAboutImages(params: IGetAboutImages): AsyncResponse<IAboutImageLimited[]>
  deleteAboutImage(params: IDeleteAboutImage): AsyncResponse<null>
  deleteAbout(params: IDeleteAbout): AsyncResponse<null>
  bulkDeleteAbouts(params: IBulkDeleteAbouts): AsyncResponse<null>
  getAbouts(params: IGetAbouts): AsyncResponse<IAboutsPagination>
  removeUnusedAbouts(params: IRemoveUnusedAbouts): AsyncResponse<null>
}
