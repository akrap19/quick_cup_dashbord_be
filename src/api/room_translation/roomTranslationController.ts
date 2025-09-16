import { NextFunction, Request, Response } from 'express'
import { RoomTranslationService } from './roomTranslationService'
import { RoomService } from '../room/roomService'
import { ResponseCode } from '../../interface'
import { RoomTranslation } from './roomTranslationModel'
import { LanguageService } from '../language/languageService'
import { IRoomTranslationsLimited, RoomStatus } from './interface'
import { autoInjectable } from 'tsyringe'
import { LanguageStatus } from '../language/interface'

@autoInjectable()
export class RoomTranslationController {
  private readonly roomTranslationService: RoomTranslationService
  private readonly roomService: RoomService
  private readonly languageService: LanguageService

  constructor(
    roomTranslationService: RoomTranslationService,
    roomService: RoomService,
    languageService: LanguageService
  ) {
    this.roomTranslationService = roomTranslationService
    this.roomService = roomService
    this.languageService = languageService
  }

  translateRoom = async (req: Request, res: Response, next: NextFunction) => {
    let {
      roomId,
      languageId,
      title,
      description,
      images,
      deletedImages,
      audioId
    } = res.locals.input
    const { barnahusId } = req.user

    const { language, code: languageCode } =
      await this.languageService.getLanguage({
        languageId
      })
    if (!language) {
      return next({ code: languageCode })
    }

    await this.roomTranslationService.createRoomTranslation({
      roomId,
      languageId,
      title,
      description,
      audioId,
      barnahusId,
      images,
      deletedImages,
      status:
        language.status == LanguageStatus.PUBLISHED
          ? RoomStatus.PUBLISHED
          : RoomStatus.DRAFT
    })

    await this.languageService.checkLanguageStatus({
      barnahusId: barnahusId,
      languageId
    })

    return next({ roomId, code: ResponseCode.OK })
  }

  getRoomTranslations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { languageId, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { roomData, code } =
      await this.roomTranslationService.getRoomTranslations({
        barnahusId,
        languageId,
        page,
        limit
      })
    if (!roomData) {
      return next({ code })
    }

    const roomTranslationsLimited: IRoomTranslationsLimited[] =
      roomData.roomTranslations.map((translation) => {
        let room = translation.room

        return {
          roomId: room.id,
          roomTranslationId: translation.id,
          name: translation.title,
          updated: translation.updatedAt,
          status: translation.status
        }
      })

    return next({
      data: {
        pagination: roomData.pagination,
        rooms: roomTranslationsLimited
      },
      code
    })
  }

  getRoomTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { roomTranslationId } = res.locals.input

    const { roomTranslation, code } =
      await this.roomTranslationService.getRoomTranslation({
        roomTranslationId
      })
    if (!roomTranslation) {
      return next({ code })
    }

    return next({
      data: {
        roomTranslation
      },
      code
    })
  }

  editRoomTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { barnahusId } = req.user
    const {
      roomTranslationId,
      title,
      description,
      audioId,
      images,
      deletedImages
    } = res.locals.input

    const { roomTranslation, code: roomTranslationCode } =
      await this.roomTranslationService.getRoomTranslation({
        roomTranslationId
      })
    if (!roomTranslation) {
      return next({ code: roomTranslationCode })
    }

    const { code } = await this.roomTranslationService.editRoomTranslation({
      roomTranslation,
      title,
      description,
      audioId,
      images,
      deletedImages
    })
    if (code !== ResponseCode.OK) {
      return next({ code })
    }

    await this.languageService.checkLanguageStatus({
      barnahusId,
      languageId: roomTranslation.languageId
    })

    return next({ code })
  }

  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = res.locals.input

    const { code } = await this.roomService.deleteRoom({
      roomId
    })

    return next({ code })
  }

  bulkDeleteRooms = async (req: Request, res: Response, next: NextFunction) => {
    const { roomIds } = res.locals.input

    const { code } = await this.roomService.bulkDeleteRooms({
      roomIds
    })

    return next({ code })
  }

  bulkTranslateRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { translations } = res.locals.input
    const { barnahusId } = req.user

    const { code } =
      await this.roomTranslationService.bulkCreateRoomTranslation({
        barnahusId,
        translations
      })

    await this.languageService.checkLanguageStatus({
      barnahusId: barnahusId,
      languageId: translations[0].languageId
    })

    return next({ code })
  }

  fullTranslateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { translations, images, deletedImages } = res.locals.input
    const { barnahusId } = req.user

    const { languagesData, code: languageCode } =
      await this.languageService.getLanguages({
        barnahusId,
        page: 1,
        limit: 1000
      })
    if (!languagesData) {
      return next({ code: languageCode })
    }

    for (let language of languagesData.languages) {
      let translationIndex = translations.findIndex(
        (translation: RoomTranslation) => translation.languageId == language.id
      )
      if (translationIndex == -1) {
        return next({ code: ResponseCode.ALL_LANGUAGES_REQUIRED })
      }

      translations[translationIndex].status = language.status
    }

    const { code } =
      await this.roomTranslationService.createFullRoomTranslations({
        barnahusId,
        translations,
        images,
        deletedImages
      })

    return next({ code })
  }
}
