import { AsyncResponse, IServiceMethod, ResponseCode } from '../../interface'
import { IAboutImageLimited } from '../about/interface'
import { NoteType } from '../note/interface'
import { IRoomImageLimited } from '../room/interface'
import { IStaffImageLimited } from '../staff/interface'
import { CaseAbout } from './caseAboutModel'
import { Case } from './caseModel'
import { CaseRoom } from './caseRoomModel'
import { CaseStaff } from './caseStaffModel'

export enum CaseStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  CLOSED = 'Closed',
  OTHER = 'Other'
}

export interface ICreateCase {
  customId: string
  barnahusId: string
  status: CaseStatus
  canAddNotes: boolean
  password?: string
  shouldChangePassword?: boolean
}

export interface IGetCases {
  barnahusId: string
  search?: string
  page: number
  limit: number
}

export interface ISearchCases {
  barnahusId: string
  search?: string
  status?: string
}

export interface ICheckCaseByCustomId {
  customId: string
}

export interface IGetCaseByCustomId {
  customId: string
}

export interface ICasesPagination {
  cases: Case[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface ICaseLimited {
  caseId: string
  customId: string
  barnahus: string
  template: string | null
  language: string | null
  canAddNotes: boolean
}

export interface IEditCase {
  caseId: string
  customId?: string
  canAddNotes?: boolean
  shouldChangePassword?: boolean
  password?: string
}

export interface IDeleteCase extends IServiceMethod {
  caseId: string
}

export interface IBulkDeleteCases {
  caseIds: string[]
}

export interface IGetCase {
  caseId: string
}

export interface ISetCaseContent extends IServiceMethod {
  caseId: string
  languageId: string
  templateId?: string
}

export interface ICreateCaseAbout extends IServiceMethod {
  caseId: string
  orderNumber: number
  title?: string
  description?: string
  audioId?: string
  aboutImages?: IAboutImageLimited[]
}

export interface ICreateCaseRoom extends IServiceMethod {
  caseId: string
  orderNumber: number
  title?: string
  description?: string
  audioId?: string
  roomImages?: IRoomImageLimited[]
}

export interface ICreateCaseStaff extends IServiceMethod {
  caseId: string
  orderNumber: number
  name?: string
  title?: string
  description?: string
  staffImages?: IStaffImageLimited[]
}

export interface IGetCaseAbouts {
  caseId: string
}

export interface IGetCaseRooms {
  caseId: string
}

export interface IGetCaseStaff {
  caseId: string
}

export interface ICheckCanAddNotes {
  contentId: string
  type: NoteType
}

export interface IChangeCasePassword {
  caseId: string
  password: string
  newPassword: string
}

export interface ICaseService {
  createCase(params: ICreateCase): AsyncResponse<ResponseCode>
  getCases(params: IGetCases): AsyncResponse<ICasesPagination>
  searchCases(params: ISearchCases): AsyncResponse<Case[]>
  getCase(params: IGetCase): AsyncResponse<Case>
  checkCaseByCustomId(params: ICheckCaseByCustomId): AsyncResponse<Case>
  getCaseByCustomId(params: IGetCaseByCustomId): AsyncResponse<Case>
  editCase(params: IEditCase): AsyncResponse<ResponseCode>
  setCaseContent(params: ISetCaseContent): AsyncResponse<ResponseCode>
  deleteCase(params: IDeleteCase): AsyncResponse<ResponseCode>
  bulkDeleteCases(params: IBulkDeleteCases): AsyncResponse<ResponseCode>
  createCaseAbout(params: ICreateCaseAbout): AsyncResponse<ResponseCode>
  createCaseRoom(params: ICreateCaseRoom): AsyncResponse<ResponseCode>
  createCaseStaff(params: ICreateCaseStaff): AsyncResponse<ResponseCode>
  getCaseAbouts(params: IGetCaseAbouts): AsyncResponse<CaseAbout[]>
  getCaseRooms(params: IGetCaseRooms): AsyncResponse<CaseRoom[]>
  getCaseStaff(params: IGetCaseStaff): AsyncResponse<CaseStaff[]>
  checkCanAddNotes(params: ICheckCanAddNotes): AsyncResponse<boolean>
  changeCasePassword(params: IChangeCasePassword): AsyncResponse<void>
}
