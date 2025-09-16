import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { Template } from './templateModel'

export enum TemplateStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  HIDDEN = 'Hidden'
}

export interface ITemplateLimited {
  templateId: string
  name: string
  isGeneral: boolean
  password: string | null
  status: string
  updated: Date
  hasCases: boolean
  addedBy: string | null
}

export interface ITemplatesPaginationLimited {
  templates: ITemplateLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICreateTemplate {
  barnahusId: string
  name: string
  isGeneral: boolean
  password?: string
  abouts: ITemplateAbout[]
  rooms: ITemplateRoom[]
  staff: ITemplateStaff[]
  addedById: string
}

export interface ITemplate {
  templateId: string
  name: string
  isGeneral: boolean
  status: string
  addedBy: string | null
  updated: Date
}

export interface ITemplateAbout {
  aboutId: string
  includeDescription: boolean
  includeAudio: boolean
  includeImages: boolean
}

export interface ITemplateRoom {
  roomId: string
  includeDescription: boolean
  includeAudio: boolean
  includeImages: boolean
  orderNumber: number
}

export interface ITemplateStaff {
  staffId: string
  includeName: boolean
  includeDescription: boolean
  includeImages: boolean
}

export interface IEditTemplateAbout {
  templateAboutId?: string
  aboutId: string
  includeDescription: boolean
  includeAudio: boolean
  includeImages: boolean
}

export interface IEditTemplateRoom {
  templateRoomId?: string
  roomId: string
  includeDescription: boolean
  includeAudio: boolean
  includeImages: boolean
  orderNumber: number
}

export interface IEditTemplateStaff {
  templateStaffId?: string
  staffId: string
  includeName: boolean
  includeDescription: boolean
  includeImages: boolean
}

export interface IGetTemplates {
  page: number
  limit: number
  search?: string
  barnahusId: string
}

export interface IGetTemplate {
  templateId: string
}

export interface IGetTemplateByName {
  name: string
}

export interface ITemplatesPagination {
  templates: Template[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IEditTemplate {
  templateId: string
  name: string
  isGeneral: boolean
  abouts: IEditTemplateAbout[]
  rooms: IEditTemplateRoom[]
  staff: IEditTemplateStaff[]
  deleteAbouts: string[]
  deleteRooms: string[]
  deleteStaff: string[]
}

export interface IDeleteTemplate extends IServiceMethod {
  templateId: string
}

export interface IBulkDeleteTemplates {
  templateIds: string[]
}

export interface ICreateTemplateAbouts extends IServiceMethod {
  abouts: {
    templateId: string
    aboutId: string
    includeDescription: boolean
    includeAudio: boolean
    includeImages: boolean
  }[]
}

export interface ICreateTemplateRooms extends IServiceMethod {
  rooms: {
    templateId: string
    roomId: string
    includeDescription: boolean
    includeAudio: boolean
    includeImages: boolean
    orderNumber: number
  }[]
}

export interface ICreateTemplateStaff extends IServiceMethod {
  staff: {
    templateId: string
    staffId: string
    includeName: boolean
    includeDescription: boolean
    includeImages: boolean
  }[]
}

export interface ITemplateService {
  createTemplateAbouts(
    params: ICreateTemplateAbouts
  ): AsyncResponse<ResponseCode>
  createTemplateRooms(params: ICreateTemplateRooms): AsyncResponse<ResponseCode>
  createTemplateStaff(params: ICreateTemplateStaff): AsyncResponse<ResponseCode>
  createTemplate(params: ICreateTemplate): AsyncResponse<ResponseCode>
  getTemplates(params: IGetTemplates): AsyncResponse<ITemplatesPagination>
  getTemplate(params: IGetTemplate): AsyncResponse<ITemplate>
  getTemplateByName(params: IGetTemplateByName): AsyncResponse<Template>
  editTemplate(params: IEditTemplate): AsyncResponse<ResponseCode>
  deleteTemplate(params: IDeleteTemplate): AsyncResponse<ResponseCode>
  bulkDeleteTemplates(params: IBulkDeleteTemplates): AsyncResponse<ResponseCode>
}
