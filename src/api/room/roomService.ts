import { ResponseCode } from '../../interface'
import {
  IAddRoomImages,
  IBulkDeleteRooms,
  ICreateRoom,
  IDeleteRoom,
  IDeleteRoomImage,
  IGetRoomImages,
  IGetRooms,
  IRemoveUnusedRooms,
  IRoomImageLimited,
  IRoomLimited,
  IRoomService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { Room } from './roomModel'
import { RoomImage } from './roomImageModel'
import { MediaService } from '../media/mediaService'
import { getSignedURL } from '../../services/google'
import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class RoomService implements IRoomService {
  private readonly roomRepository: Repository<Room>
  private readonly roomImageRepository: Repository<RoomImage>
  private readonly mediaService: MediaService

  constructor(mediaService: MediaService) {
    this.roomRepository = AppDataSource.manager.getRepository(Room)
    this.roomImageRepository = AppDataSource.manager.getRepository(RoomImage)
    this.mediaService = mediaService
  }

  createRoom = async ({ barnahusId, queryRunner }: ICreateRoom) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let insertResult = await this.roomRepository
        .createQueryBuilder('room', queryRunner)
        .insert()
        .into(Room)
        .values([
          {
            barnahusId
          }
        ])
        .execute()
      if (insertResult.raw.affectedRows !== 1) {
        code = ResponseCode.FAILED_INSERT
      }

      return { roomId: insertResult.identifiers[0].id as string, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  addRoomImages = async ({ images, queryRunner }: IAddRoomImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      if (images.length == 0) {
        return { code }
      }

      let insertResult = await this.roomImageRepository
        .createQueryBuilder('roomImage', queryRunner)
        .insert()
        .into(RoomImage)
        .values(images)
        .execute()

      if (insertResult.raw.affectedRows !== images.length) {
        code = ResponseCode.FAILED_INSERT
      }

      return { code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  getRoomImages = async ({ roomId, signUrl = true }: IGetRoomImages) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let roomImages = await this.roomImageRepository
        .createQueryBuilder('roomImage')
        .leftJoinAndSelect('roomImage.media', 'media')
        .where('roomImage.roomId = :roomId', { roomId })
        .getMany()

      let roomImagesLimited: IRoomImageLimited[] = []

      for (let image of roomImages) {
        roomImagesLimited.push({
          roomImageId: image.id,
          mediaId: image.mediaId,
          url: signUrl
            ? (await getSignedURL(image.media.url)) || image.media.url
            : image.media.url
        })
      }

      return { roomImages: roomImagesLimited, code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  deleteRoomImage = async ({ roomImageId }: IDeleteRoomImage) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let roomImage = await this.roomImageRepository
        .createQueryBuilder('roomImage')
        .where('id = :roomImageId', { roomImageId })
        .getOne()
      if (!roomImage) {
        return { code: ResponseCode.MEDIA_NOT_FOUND }
      }

      const { code } = await this.mediaService.deleteMedia({
        mediaId: roomImage.mediaId
      })

      await this.roomImageRepository
      .createQueryBuilder('roomImage')
      .delete()
      .where('id = :roomImageId', { roomImageId })
      .execute()

      return { code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  deleteRoom = async ({ roomId, queryRunner }: IDeleteRoom) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let room = await this.roomRepository
        .createQueryBuilder('room', queryRunner)
        .where('id = :roomId', { roomId })
        .getOne()
      if (!room) {
        return { code: ResponseCode.ROOM_NOT_FOUND }
      }

      const deleteResult = await this.roomRepository
        .createQueryBuilder('room', queryRunner)
        .delete()
        .from(Room)
        .where('id = :roomId', { roomId })
        .execute()

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }

      return { code }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  bulkDeleteRooms = async ({ roomIds }: IBulkDeleteRooms) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (const roomId of roomIds) {
        const deleteResult = await this.deleteRoom({ roomId, queryRunner })

        if (deleteResult.code != ResponseCode.OK) {
          code = deleteResult.code
          await queryRunner.rollbackTransaction()
          await queryRunner.release()

          return { code }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })

      await queryRunner.rollbackTransaction()
      await queryRunner.release()
    }

    return { code }
  }

  getRooms = async ({ barnahusId, page, limit }: IGetRooms) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.roomRepository
        .createQueryBuilder('room')
        .where('room.barnahusId = :barnahusId', { barnahusId })

      page = page || 1
      const offset = limit && page ? (page - 1) * limit : 0
      const [rooms, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      const roomsLimited: IRoomLimited[] = rooms.map((room) => {
        return {
          roomId: room.id,
          barnahusId: room.barnahusId
        }
      })

      return {
        roomData: {
          rooms: roomsLimited,
          pagination: {
            count,
            page,
            limit
          }
        },
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  removeUnusedRooms = async ({ barnahusId }: IRemoveUnusedRooms) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const roomsWithoutTranslations = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoin('room.roomTranslations', 'roomTranslation')
        .where('roomTranslation.roomId IS NULL')
        .andWhere('room.barnahusId = :barnahusId', { barnahusId })
        .getMany()

      if (roomsWithoutTranslations.length === 0) {
        return { code }
      }

      await this.roomRepository
        .createQueryBuilder('room')
        .delete()
        .from(Room)
        .where('room.id IN (:...roomIds)', {
          roomIds: roomsWithoutTranslations.map((x) => x.id)
        })
        .execute()

      return {
        code
      }
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }
}
