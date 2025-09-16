import { AsyncResponse, ResponseCode } from '../../interface'

export enum NoteType {
  ABOUT = 'About',
  ROOM = 'Room',
  STAFF = 'Staff'
}

export interface INoteLimited {
  noteId: string
  contentId: string
  title: string
  note: string
  type: NoteType
  writtenAt: Date
}

export interface ICreateNote {
  contentId: string
  type: NoteType
  note: string
}

export interface IGetNotes {
  caseId: string
}

export interface IDeleteNotes {
  caseId: string
  aboutNotes: string[]
  roomNotes: string[]
  staffNotes: string[]
}

export interface IEditNote {
  noteId: string
  type: NoteType
  note: string
}

export interface INoteService {
  createNote(params: ICreateNote): AsyncResponse<ResponseCode>
  getNotes(params: IGetNotes): AsyncResponse<INoteLimited[]>
  deleteNotes(params: IDeleteNotes): AsyncResponse<ResponseCode>
  editNote(params: IEditNote): AsyncResponse<ResponseCode>
}
