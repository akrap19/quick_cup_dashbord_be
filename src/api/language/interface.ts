import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { IAboutImageLimited } from '../about/interface'
import { IRoomImageLimited } from '../room/interface'
import { IStaffImageLimited } from '../staff/interface'
import { BarnahusLanguage } from './languageModel'

export enum LanguageStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  HIDDEN = 'Hidden'
}

export interface ITranslation {
  abouts: IAboutTranslation[]
  rooms: IRoomTranslation[]
  staff: IStaffTranslation[]
}

export interface IAboutTranslation {
  aboutId: string
  title: string | null
  description: string | null
  audio: {
    audioId: string
    audioURL: string | null
    audioName: string | null
  } | null
  aboutImages?: IAboutImageLimited[]
}

export interface IRoomTranslation {
  roomId: string
  title: string | null
  description: string | null
  audio: {
    audioId: string
    audioURL: string | null
    audioName: string | null
  } | null
  roomImages?: IRoomImageLimited[]
}

export interface IStaffTranslation {
  staffId: string
  name: string | null
  title: string | null
  description: string | null
  staffImages?: IStaffImageLimited[]
}

export interface ICreateLanguage {
  name: string
  languageCode?: string
  autoTranslate: boolean
  translateable?: boolean
  barnahusId: string
}

export interface IGetLanguages {
  status?: LanguageStatus
  page: number
  limit: number
  barnahusId: string
}

export interface IGetDefaultLanguage {
  barnahusId: string
}

export interface ILanguageLimited {
  languageId: string
  name: string
  status: string
  autoTranslate: boolean
  translateable: boolean
  isDefault: boolean
  hasCases: boolean
}

export interface ILanguagesPagination {
  languages: BarnahusLanguage[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ILanguagesPaginationLimited {
  languages: ILanguageLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IEditLanguage {
  languageId: string
  name: string
  autoTranslate: boolean
  status: LanguageStatus
}

export interface IDeleteLanguage extends IServiceMethod {
  languageId: string
}

export interface IBulkDeleteLanguages {
  barnahusId: string
  languageIds: Array<string>
}

export interface ISearchSupportedLanguages {
  search?: string
}

export interface IGetLanguage {
  languageId: string
}

export interface ICheckLanguagePublishable {
  languageId: string
  barnahusId: string
}

export interface IPublishLanguage extends IServiceMethod {
  languageId: string
  barnahusId: string
}

export interface IAutoTranslate {
  languageId: string
  barnahusId: string
}

export interface ITranslateContent {
  languageId: string
  content: string
}

export interface ISearchLanguages {
  search?: string
  status?: string[]
  barnahusId: string
}

export interface ISetDefaultLanguage {
  languageId: string
  barnahusId: string
}

export interface ICheckLanguageStatus {
  languageId: string
  barnahusId: string
}

export interface ILanguageService {
  createLanguage(params: ICreateLanguage): AsyncResponse<ResponseCode>
  getLanguages(params: IGetLanguages): AsyncResponse<ILanguagesPagination>
  getLanguage(params: IGetLanguage): AsyncResponse<BarnahusLanguage>
  getDefaultLanguage(
    params: IGetDefaultLanguage
  ): AsyncResponse<BarnahusLanguage>
  editLanguage(params: IEditLanguage): AsyncResponse<null>
  deleteLanguage(params: IDeleteLanguage): AsyncResponse<ResponseCode>
  bulkDeleteLanguages(params: IBulkDeleteLanguages): AsyncResponse<object[]>
  searchSupportedLanguages(
    params: ISearchSupportedLanguages
  ): AsyncResponse<any>
  checkLanguagePublishable(
    params: ICheckLanguagePublishable
  ): AsyncResponse<boolean>
  searchLanguages(params: ISearchLanguages): AsyncResponse<BarnahusLanguage[]>
  publishLanguage(params: IPublishLanguage): AsyncResponse<null>
  autoTranslate(params: IAutoTranslate): AsyncResponse<ITranslation>
  translateContent(params: ITranslateContent): AsyncResponse<string>
  setDefaultLanguage(params: ISetDefaultLanguage): AsyncResponse<void>
  checkLanguageStatus(params: ICheckLanguageStatus): AsyncResponse<void>
}
