import fileUpload from 'express-fileupload'
import { AsyncResponse } from '../../interface'

export enum MediaType {
  IMAGE = 'Image',
  AUDIO = 'Audio',
  VIDEO = 'Video',
  FILE = 'File'
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const ACCEPTED_VIDEO_TYPES = ['video/mp4']

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg']

export const ACCEPTED_FILE_TYPES = [
  // PDF documents
  'application/pdf',
  // Microsoft Word documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Microsoft Excel documents
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Microsoft PowerPoint documents
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text documents
  'text/plain',
  'text/rtf',
  'application/rtf',
  // OpenDocument formats
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  // Other common document types
  'application/vnd.apple.pages',
  'application/vnd.apple.numbers',
  'application/vnd.apple.keynote'
]

export interface ICreateMedia {
  type: MediaType
  path: string
  file: fileUpload.UploadedFile
}

export interface IDeleteMedia {
  mediaId: string
}

export interface IGetMedia {
  mediaId: string
}

export interface IMediaLimited {
  id: string
  name: string
  url: string
}

export interface IGetMediaByName {
  name: string
}

export interface IDownloadMedia {
  mediaId: string
}

export interface IMediaService {
  createMedia(params: ICreateMedia): AsyncResponse<number>
  getMedia(params: IGetMedia): AsyncResponse<IMediaLimited>
  getMediaByName(params: IGetMediaByName): AsyncResponse<IMediaLimited>
  deleteMedia(params: IDeleteMedia): AsyncResponse<null>
  downloadMedia(params: IDownloadMedia): AsyncResponse<{ buffer: Buffer; fileName: string; mimeType: string }>
}
