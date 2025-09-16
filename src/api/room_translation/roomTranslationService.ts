import { ResponseCode } from '../../interface'
import {
  IBulkChangeRoomTranslationStatus,
  IBulkCreateRoomTranslation,
  IChangeRoomTranslationStatus,
  ICheckRoomsTranslated,
  ICreateFullRoomTranslation,
  ICreateRoomTranslation,
  IEditRoomTranslation,
  IGetRoomTranslation,
  IGetRoomTranslations,
  IGetRoomTranslationsByLanguageId,
  IRoomTranslation,
  IRoomTranslationService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { RoomTranslation } from './roomTranslationModel'
import { Repository } from 'typeorm'
import { RoomService } from '../room/roomService'
import { autoInjectable } from 'tsyringe'
import { MediaService } from '../media/mediaService'

@autoInjectable()
export class RoomTranslationService implements IRoomTranslationService {
  private readonly roomTranslationRepository: Repository<RoomTranslation>
  private readonly roomService: RoomService
  private readonly mediaService: MediaService

  constructor(roomService: RoomService, mediaService: MediaService) {
    this.roomTranslationRepository =
      AppDataSource.manager.getRepository(RoomTranslation)
    this.roomService = roomService
    this.mediaService = mediaService
  }

  createRoomTranslation = async ({
    roomId,
    languageId,
    title,
    description,
    audioId,
    barnahusId,
    images,
    deletedImages,
    status
  }: ICreateRoomTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (!roomId) {
        const { roomId: newRoomId, code: roomCode } =
          await this.roomService.createRoom({
            barnahusId,
            queryRunner
          })

        if (!newRoomId) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: roomCode }
        }

        roomId = newRoomId
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          roomId: roomId!,
          mediaId: image
        }))

        const { code: imageCode } = await this.roomService.addRoomImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.roomService.deleteRoomImage({
            roomImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      let insertResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .insert()
        .into(RoomTranslation)
        .values([
          {
            roomId,
            languageId,
            title,
            description,
            audioId,
            status
          }
        ])
        .execute()

      if (insertResult.raw.affectedRows !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_TRANSLATION
          break
        default:
          code = ResponseCode.SERVER_ERROR
          logger.error({
            code,
            message: getResponseMessage(code),
            stack: err.stack
          })
      }
    }

    return { code }
  }

  getRoomTranslations = async ({
    barnahusId,
    languageId,
    page,
    limit
  }: IGetRoomTranslations) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let query = this.roomTranslationRepository
        .createQueryBuilder('roomTranslation')
        .leftJoinAndSelect('roomTranslation.room', 'room')
        .leftJoinAndSelect('roomTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('roomTranslation.audio', 'media')
        .leftJoinAndSelect('room.roomImages', 'roomImage')
        .where('room.barnahusId = :barnahusId', { barnahusId })
        .andWhere('roomTranslation.languageId = :languageId', { languageId })

      const offset = (page - 1) * limit
      const [roomTranslations, count] = await query
        .limit(limit)
        .offset(offset)
        .getManyAndCount()

      if (!roomTranslations) {
        return { code: ResponseCode.ROOM_TRANSLATION_NOT_FOUND }
      }

      return {
        roomData: {
          roomTranslations,
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

  getRoomTranslation = async ({ roomTranslationId }: IGetRoomTranslation) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let translation = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation')
        .leftJoinAndSelect('roomTranslation.room', 'room')
        .leftJoinAndSelect('roomTranslation.language', 'barnahusLanguage')
        .leftJoinAndSelect('room.roomImages', 'roomImage')
        .where('roomTranslation.id = :roomTranslationId', { roomTranslationId })
        .getOne()

      if (!translation) {
        return { code: ResponseCode.ROOM_TRANSLATION_NOT_FOUND }
      }

      let room = translation.room

      const { media: audio, code: audioCode } =
        await this.mediaService.getMedia({
          mediaId: translation.audioId ?? ''
        })

      const { roomImages, code: imagesCode } =
        await this.roomService.getRoomImages({ roomId: room.id })
      if (!roomImages) {
        return { code: imagesCode }
      }

      return {
        roomTranslation: {
          roomId: room.id,
          roomTranslationId: translation.id,
          languageId: translation.languageId,
          title: translation.title,
          description: translation.description,
          audio,
          updated: translation.updatedAt,
          status: translation.status,
          roomImages
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

  getRoomTranslationsByLanguageId = async ({
    roomIds,
    languageId
  }: IGetRoomTranslationsByLanguageId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const roomTranslations: IRoomTranslation[] = []
      if (roomIds.length == 0) {
        return { roomTranslations, code }
      }

      let translations = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation')
        .leftJoinAndSelect('roomTranslation.room', 'room')
        .leftJoinAndSelect('roomTranslation.language', 'barnahusLanguage')
        .where('roomTranslation.roomId IN (:...roomIds)', {
          roomIds
        })
        .andWhere('roomTranslation.languageId = :languageId', { languageId })
        .getMany()

      if (translations.length != roomIds.length) {
        return { code: ResponseCode.ROOM_TRANSLATION_NOT_FOUND }
      }

      for (const roomTranslation of translations) {
        const { roomImages, code: imagesCode } =
          await this.roomService.getRoomImages({
            roomId: roomTranslation.roomId,
            signUrl: false
          })
        if (!roomImages) {
          return { code: imagesCode }
        }

        roomTranslations.push({
          roomId: roomTranslation.room.id,
          roomTranslationId: roomTranslation.id,
          languageId: roomTranslation.languageId,
          title: roomTranslation.title,
          description: roomTranslation.description,
          audioId: roomTranslation.audioId,
          updated: roomTranslation.updatedAt,
          status: roomTranslation.status,
          roomImages
        })
      }

      return {
        roomTranslations,
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

  editRoomTranslation = async ({
    roomTranslation,
    title,
    description,
    audioId,
    images,
    deletedImages
  }: IEditRoomTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      if (!audioId && roomTranslation.audio) {
        await this.mediaService.deleteMedia({
          mediaId: roomTranslation.audio.id
        })
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          roomId: roomTranslation.roomId,
          mediaId: image
        }))

        const { code: imageCode } = await this.roomService.addRoomImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.roomService.deleteRoomImage({
            roomImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      const roomTranslationEditResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .update(RoomTranslation)
        .set({
          title,
          description,
          audioId
        })
        .where('id = :roomTranslationId', {
          roomTranslationId: roomTranslation.roomTranslationId
        })
        .execute()

      if (roomTranslationEditResult.affected !== 1) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_EDIT }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  checkRoomsTranslated = async ({
    barnahusId,
    languageId
  }: ICheckRoomsTranslated) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { roomData: roomTranslationData, code: roomTranslationDataCode } =
        await this.getRoomTranslations({
          barnahusId,
          languageId,
          page: 1,
          limit: 1000
        })
      if (!roomTranslationData) {
        return { code: roomTranslationDataCode }
      }

      const { roomData, code: roomDataCode } = await this.roomService.getRooms({
        barnahusId,
        page: 1,
        limit: 1000
      })
      if (!roomData) {
        return { code: roomDataCode }
      }

      let translated =
        roomData.rooms.length > 0 &&
        roomTranslationData.roomTranslations.length == roomData.rooms.length

      return { translated, code }
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

  bulkCreateRoomTranslation = async ({
    barnahusId,
    translations
  }: IBulkCreateRoomTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      for (let translation of translations) {
        if (!translation.roomId) {
          const { roomId: newRoomId, code: roomCode } =
            await this.roomService.createRoom({
              barnahusId,
              queryRunner
            })

          if (!newRoomId) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: roomCode }
          }

          translation.roomId = newRoomId
        }

        if (translation.images) {
          const mappedImages = translation.images.map((image) => ({
            roomId: translation.roomId!,
            mediaId: image
          }))

          const { code: imageCode } = await this.roomService.addRoomImages({
            images: mappedImages,
            queryRunner
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }

        if (translation.deletedImages) {
          for (let image of translation.deletedImages) {
            const { code: imageCode } = await this.roomService.deleteRoomImage({
              roomImageId: image
            })

            if (imageCode != ResponseCode.OK) {
              await queryRunner.rollbackTransaction()
              await queryRunner.release()
              return { code: imageCode }
            }
          }
        }
      }

      let insertResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .insert()
        .into(RoomTranslation)
        .values(translations)
        .execute()

      if (insertResult.raw.affectedRows !== translations.length) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      switch (err.errno) {
        case 1062:
          code = ResponseCode.CONFLICT_DUPLICATE_TRANSLATION
          break
        default:
          code = ResponseCode.SERVER_ERROR
          logger.error({
            code,
            message: getResponseMessage(code),
            stack: err.stack
          })
      }
    }

    return { code }
  }

  createFullRoomTranslations = async ({
    barnahusId,
    translations,
    images,
    deletedImages
  }: ICreateFullRoomTranslation) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { roomId, code: roomCode } = await this.roomService.createRoom({
        barnahusId,
        queryRunner
      })
      if (!roomId) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: roomCode }
      }

      const mappedTranslations = translations.map(
        ({ languageId, title, description, audioId, status }) => ({
          roomId,
          languageId,
          title,
          description,
          audioId,
          status
        })
      )

      let insertResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .insert()
        .into(RoomTranslation)
        .values(mappedTranslations)
        .execute()

      if (insertResult.raw.affectedRows !== mappedTranslations.length) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: ResponseCode.FAILED_INSERT }
      }

      if (images) {
        const mappedImages = images.map((image) => ({
          roomId,
          mediaId: image
        }))

        const { code: imageCode } = await this.roomService.addRoomImages({
          images: mappedImages,
          queryRunner
        })

        if (imageCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: imageCode }
        }
      }

      if (deletedImages) {
        for (let image of deletedImages) {
          const { code: imageCode } = await this.roomService.deleteRoomImage({
            roomImageId: image
          })

          if (imageCode != ResponseCode.OK) {
            await queryRunner.rollbackTransaction()
            await queryRunner.release()
            return { code: imageCode }
          }
        }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
    } catch (err: any) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()

      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code }
  }

  changeRoomTranslationStatus = async ({
    roomTranslationId,
    status,
    queryRunner
  }: IChangeRoomTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const roomTranslationEditResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .update(RoomTranslation)
        .set({
          status
        })
        .where('id = :roomTranslationId', { roomTranslationId })
        .execute()

      if (roomTranslationEditResult.affected !== 1) {
        return { code: ResponseCode.FAILED_EDIT }
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

  bulkChangeRoomTranslationStatus = async ({
    barnahusId,
    languageId,
    status,
    queryRunner
  }: IBulkChangeRoomTranslationStatus) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { roomData: roomTranslationData, code: roomTranslationDataCode } =
        await this.getRoomTranslations({
          barnahusId,
          languageId,
          page: 1,
          limit: 1000
        })
      if (!roomTranslationData) {
        return { code: roomTranslationDataCode }
      }

      const mappedRoomIds = roomTranslationData.roomTranslations.map(
        (room) => room.roomId
      )

      const roomTranslationEditResult = await this.roomTranslationRepository
        .createQueryBuilder('roomTranslation', queryRunner)
        .update(RoomTranslation)
        .set({
          status
        })
        .where('roomId IN (:...roomIds)', {
          roomIds: mappedRoomIds
        })
        .andWhere('languageId = :languageId', { languageId })
        .execute()

      if (roomTranslationEditResult.affected !== mappedRoomIds.length) {
        return { code: ResponseCode.FAILED_EDIT }
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
