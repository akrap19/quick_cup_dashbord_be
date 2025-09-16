import { AsyncResponse, IServiceMethod } from '../../interface'
import { IMediaLimited } from '../media/interface'
import { IStaffImageLimited } from '../staff/interface'
import { StaffTranslation } from './staffTranslationModel'

export enum StaffStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  HIDDEN = 'Hidden'
}

export interface IStaffTranslationLimited {
  staffId: string
  staffTranslationId: string
  name: string
  updated: Date
  status: StaffStatus
}

export interface IStaffTranslation {
  staffId: string
  staffTranslationId: string
  languageId: string
  name: string
  title?: string
  description?: string
  updated: Date
  status: StaffStatus
  staffImages: IStaffImageLimited[]
}

export interface IStaffTranslationsPagination {
  staffTranslations: StaffTranslation[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateStaffTranslation {
  barnahusId: string
  staffId?: string
  name?: string
  languageId: string
  title?: string
  description?: string
  images?: string[]
  deletedImages?: string[]
  status: StaffStatus
}

export interface IGetStaffTranslations {
  barnahusId: string
  languageId: string
  page: number
  limit: number
}

export interface IEditStaffTranslation {
  staffTranslation: IStaffTranslation
  name: string
  title?: string
  description?: string
  audioId?: string
  images?: string[]
  deletedImages?: string[]
}

export interface IGetStaffTranslation {
  staffTranslationId: string
}

export interface IGetStaffTranslationsByLanguageId {
  staffIds: string[]
  languageId: string
}

export interface ICheckStaffTranslated {
  barnahusId: string
  languageId: string
}

export interface IBulkCreateStaffTranslation {
  barnahusId: string
  translations: ICreateStaffTranslation[]
}

export interface IFullStaffTranslation {
  languageId: string
  title?: string
  description?: string
  status?: StaffStatus
}

export interface ICreateFullStaffTranslation {
  barnahusId: string
  name: string
  translations: IFullStaffTranslation[]
  images: string[]
  deletedImages: string[]
}

export interface IChangeStaffTranslationStatus extends IServiceMethod {
  staffTranslationId: string
  status: StaffStatus.HIDDEN | StaffStatus.PUBLISHED
}

export interface IBulkChangeStaffTranslationStatus extends IServiceMethod {
  barnahusId: string
  languageId: string
  status: StaffStatus
}
export interface IStaffTranslationService {
  createStaffTranslation(params: ICreateStaffTranslation): AsyncResponse<number>
  getStaffTranslations(
    params: IGetStaffTranslations
  ): AsyncResponse<IStaffTranslationsPagination>
  getStaffTranslation(
    params: IGetStaffTranslation
  ): AsyncResponse<IStaffTranslation>
  getStaffTranslationsByLanguageId(
    params: IGetStaffTranslationsByLanguageId
  ): AsyncResponse<IStaffTranslationLimited[]>
  editStaffTranslation(params: IEditStaffTranslation): AsyncResponse<null>
  checkStaffTranslated(params: ICheckStaffTranslated): AsyncResponse<boolean>
  bulkCreateStaffTranslation(
    params: IBulkCreateStaffTranslation
  ): AsyncResponse<null>
  createFullStaffTranslations(
    params: ICreateFullStaffTranslation
  ): AsyncResponse<null>
  changeStaffTranslationStatus(
    params: IChangeStaffTranslationStatus
  ): AsyncResponse<null>
  bulkChangeStaffTranslationStatus(
    params: IBulkChangeStaffTranslationStatus
  ): AsyncResponse<null>
}
