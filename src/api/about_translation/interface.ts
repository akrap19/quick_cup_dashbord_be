import { AsyncResponse, IServiceMethod } from '../../interface'
import { IAboutImageLimited } from '../about/interface'
import { LanguageStatus } from '../language/interface'
import { IMediaLimited } from '../media/interface'
import { AboutTranslation } from './aboutTranslationModel'

export enum AboutStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  HIDDEN = 'Hidden'
}

export interface IAboutTranslationLimited {
  aboutId: string
  aboutTranslationId: string
  name?: string
  updated: Date
  status: AboutStatus
}

export interface IAboutTranslation {
  aboutId: string
  aboutTranslationId: string
  languageId: string
  title?: string
  description?: string
  audio?: IMediaLimited
  audioId?: string
  updated: Date
  status: AboutStatus
  aboutImages: IAboutImageLimited[]
}

export interface IAboutTranslationsPagination {
  aboutTranslations: AboutTranslation[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateAboutTranslation {
  barnahusId: string
  aboutId?: string
  languageId: string
  title: string
  description: string
  audioId?: string
  images?: string[]
  deletedImages?: string[]
  status: AboutStatus
}

export interface IGetAboutTranslations {
  barnahusId: string
  languageId: string
  page: number
  limit: number
}

export interface IEditAboutTranslation {
  aboutTranslation: IAboutTranslation
  title: string
  description: string
  audioId?: string
  images?: string[]
  deletedImages?: string[]
}

export interface IGetAboutTranslation {
  aboutTranslationId: string
}

export interface IGetAboutTranslationsByLanguageId {
  aboutIds: string[]
  languageId: string
}

export interface ICheckAboutTranslated {
  barnahusId: string
  languageId: string
}

export interface IBulkCreateAboutTranslation {
  barnahusId: string
  translations: ICreateAboutTranslation[]
}

export interface IFullAboutTranslation {
  languageId: string
  title: string
  description: string
  status?: AboutStatus
  audioId?: string
}

export interface ICreateFullAboutTranslation {
  barnahusId: string
  translations: IFullAboutTranslation[]
  images: string[],
  deletedImages: string[]
}

export interface IChangeAboutTranslationStatus extends IServiceMethod {
  aboutTranslationId: string
  status: AboutStatus.HIDDEN | AboutStatus.PUBLISHED
}

export interface IBulkChangeAboutTranslationStatus extends IServiceMethod {
  barnahusId: string
  languageId: string
  status: AboutStatus
}

export interface IAboutTranslationService {
  createAboutTranslation(params: ICreateAboutTranslation): AsyncResponse<number>
  getAboutTranslations(
    params: IGetAboutTranslations
  ): AsyncResponse<IAboutTranslationsPagination>
  getAboutTranslation(
    params: IGetAboutTranslation
  ): AsyncResponse<IAboutTranslation>
  getAboutTranslationsByLanguageId(
    params: IGetAboutTranslationsByLanguageId
  ): AsyncResponse<IAboutTranslation[]>
  editAboutTranslation(params: IEditAboutTranslation): AsyncResponse<null>
  checkAboutsTranslated(params: ICheckAboutTranslated): AsyncResponse<boolean>
  bulkCreateAboutTranslation(
    params: IBulkCreateAboutTranslation
  ): AsyncResponse<null>
  createFullAboutTranslations(
    params: ICreateFullAboutTranslation
  ): AsyncResponse<null>
  changeAboutTranslationStatus(
    params: IChangeAboutTranslationStatus
  ): AsyncResponse<null>
  bulkChangeAboutTranslationStatus(
    params: IBulkChangeAboutTranslationStatus
  ): AsyncResponse<null>
}
