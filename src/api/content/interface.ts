import { AsyncResponse, ResponseCode } from '../../interface'
import { IAboutImageLimited } from '../about/interface'
import { IRoomImageLimited } from '../room/interface'
import { IStaffImageLimited } from '../staff/interface'
import {
  ITemplateAbout,
  ITemplateRoom,
  ITemplateStaff
} from '../template/interface'

export interface IGetContentResponse {
  abouts: IContentAboutLimited[]
  rooms: IContentRoomLimited[]
  staff: IContentStaffLimited[]
}

export interface IContentAboutLimited {
  aboutId: string
  contentAboutId?: string
  orderNumber: number
  title: string | null
  description: string | null
  audio: {
    audioId: string
    audioURL: string | null
    audioName: string | null
  } | null
  aboutImages?: IAboutImageLimited[]
}

export interface IContentRoomLimited {
  roomId: string
  contentRoomId?: string
  orderNumber: number
  title: string | null
  description: string | null
  audio: {
    audioId: string
    audioURL: string | null
    audioName: string | null
  } | null
  roomImages?: IRoomImageLimited[]
}

export interface IContentStaffLimited {
  staffId: string
  contentStaffId?: string
  orderNumber: number
  name: string | null
  title: string | null
  description: string | null
  staffImages?: IStaffImageLimited[]
}

export interface IGetContent {
  languageId: string
  barnahusId: string
}

export interface ICreateCaseContent {
  caseId: string
  languageId: string
  templateId: string
}

export interface ICreateCustomCaseContent {
  caseId: string
  languageId: string
  abouts: ITemplateAbout[]
  rooms: ITemplateRoom[]
  staff: ITemplateStaff[]
}

export interface IGetCaseContent {
  caseId: string
}

export interface IGetDefaultBarnahusContent {
  languageId: string
  barnahusId: string
}

export interface IRemoveUnusedContent {
  barnahusId: string
}

export interface IContentService {
  getContent(params: IGetContent): AsyncResponse<IGetContentResponse>
  createCaseContent(params: ICreateCaseContent): AsyncResponse<ResponseCode>
  createCustomCaseContent(
    params: ICreateCustomCaseContent
  ): AsyncResponse<ResponseCode>
  getCaseContent(params: IGetCaseContent): AsyncResponse<IGetContentResponse>
  removeUnusedContent(params: IRemoveUnusedContent): AsyncResponse<void>
}
