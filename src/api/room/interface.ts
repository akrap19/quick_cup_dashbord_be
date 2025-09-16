import { AsyncResponse, IServiceMethod } from '../../interface'

export interface IRoomsPagination {
  rooms: IRoomLimited[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IRoomLimited {
  roomId: string
  barnahusId: string
}

export interface IRoomImageLimited {
  roomImageId: string
  mediaId: string
  url: string
}

export interface ICreateRoom extends IServiceMethod {
  barnahusId: string
}

export interface IAddRoomImages extends IServiceMethod {
  images: {
    roomId: string
    mediaId: string
  }[]
}

export interface IGetRoomImages {
  roomId: string
  signUrl?: boolean
}

export interface IDeleteRoomImage {
  roomImageId: string
}

export interface IDeleteRoom extends IServiceMethod {
  roomId: string
}

export interface IBulkDeleteRooms {
  roomIds: Array<string>
}

export interface IGetRooms {
  barnahusId: string
  page: number
  limit: number
}

export interface IRemoveUnusedRooms {
  barnahusId: string
}

export interface IRoomService {
  createRoom(params: ICreateRoom): AsyncResponse<string>
  addRoomImages(params: IAddRoomImages): AsyncResponse<null>
  getRoomImages(params: IGetRoomImages): AsyncResponse<IRoomImageLimited[]>
  deleteRoomImage(params: IDeleteRoomImage): AsyncResponse<null>
  deleteRoom(params: IDeleteRoom): AsyncResponse<null>
  bulkDeleteRooms(params: IBulkDeleteRooms): AsyncResponse<null>
  getRooms(params: IGetRooms): AsyncResponse<IRoomsPagination>
  removeUnusedRooms(params: IRemoveUnusedRooms): AsyncResponse<null>
}
