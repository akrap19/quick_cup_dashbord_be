import { AsyncResponse, IServiceMethod } from '../../interface'
import { IMediaLimited } from '../media/interface'
import { IRoomImageLimited } from '../room/interface'
import { RoomTranslation } from './roomTranslationModel'

export enum RoomStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  HIDDEN = 'Hidden'
}

export interface IRoomTranslationsLimited {
  roomId: string
  roomTranslationId: string
  name?: string
  updated: Date
  status: RoomStatus
}

export interface IRoomTranslation {
  roomId: string
  roomTranslationId: string
  languageId: string
  title?: string
  description?: string
  audio?: IMediaLimited
  audioId?: string
  updated: Date
  status: RoomStatus
  roomImages: IRoomImageLimited[]
}

export interface IRoomTranslationsPagination {
  roomTranslations: RoomTranslation[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateRoomTranslation {
  barnahusId: string
  roomId?: string
  languageId: string
  title?: string
  description?: string
  audioId?: string
  images?: string[]
  deletedImages?: string[]
  status: RoomStatus
}

export interface IGetRoomTranslations {
  barnahusId: string
  languageId: string
  page: number
  limit: number
}

export interface IEditRoomTranslation {
  roomTranslation: IRoomTranslation
  title?: string
  description?: string
  audioId?: string
  images?: string[]
  deletedImages?: string[]
}

export interface IGetRoomTranslation {
  roomTranslationId: string
}

export interface IGetRoomTranslationsByLanguageId {
  roomIds: string[]
  languageId: string
}

export interface ICheckRoomsTranslated {
  barnahusId: string
  languageId: string
}

export interface IBulkCreateRoomTranslation {
  barnahusId: string
  translations: ICreateRoomTranslation[]
}

export interface IFullRoomTranslation {
  languageId: string
  title?: string
  description?: string
  status?: RoomStatus
  audioId?: string
}

export interface ICreateFullRoomTranslation {
  barnahusId: string
  translations: IFullRoomTranslation[]
  images: string[]
  deletedImages: string[]
}

export interface IChangeRoomTranslationStatus extends IServiceMethod {
  roomTranslationId: string
  status: RoomStatus.HIDDEN | RoomStatus.PUBLISHED
}

export interface IBulkChangeRoomTranslationStatus extends IServiceMethod {
  barnahusId: string
  languageId: string
  status: RoomStatus
}

export interface IRoomTranslationService {
  createRoomTranslation(params: ICreateRoomTranslation): AsyncResponse<number>
  getRoomTranslations(
    params: IGetRoomTranslations
  ): AsyncResponse<IRoomTranslationsPagination>
  getRoomTranslation(
    params: IGetRoomTranslation
  ): AsyncResponse<IRoomTranslation>
  getRoomTranslationsByLanguageId(
    params: IGetRoomTranslationsByLanguageId
  ): AsyncResponse<IRoomTranslation[]>
  editRoomTranslation(params: IEditRoomTranslation): AsyncResponse<null>
  checkRoomsTranslated(params: ICheckRoomsTranslated): AsyncResponse<boolean>
  bulkCreateRoomTranslation(
    params: IBulkCreateRoomTranslation
  ): AsyncResponse<null>
  createFullRoomTranslations(
    params: ICreateFullRoomTranslation
  ): AsyncResponse<null>
  changeRoomTranslationStatus(
    params: IChangeRoomTranslationStatus
  ): AsyncResponse<null>
  bulkChangeRoomTranslationStatus(
    params: IBulkChangeRoomTranslationStatus
  ): AsyncResponse<null>
}
