import fileUpload from 'express-fileupload'
import { AsyncResponse } from '../../interface'

export enum MediaType {
  IMAGE = 'Image',
  AUDIO = 'Audio',
  VIDEO = 'Video'
}

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

export const ACCEPTED_VIDEO_TYPES = ['video/mp4']

export const ACCEPTED_AUDIO_TYPES = ['audio/mpeg']

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

export interface IMediaService {
  createMedia(params: ICreateMedia): AsyncResponse<number>
  getMedia(params: IGetMedia): AsyncResponse<IMediaLimited>
  getMediaByName(params: IGetMediaByName): AsyncResponse<IMediaLimited>
  deleteMedia(params: IDeleteMedia): AsyncResponse<null>
}
