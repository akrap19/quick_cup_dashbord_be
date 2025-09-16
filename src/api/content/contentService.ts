import { AsyncResponse, ResponseCode } from '../../interface'
import {
  IContentAboutLimited,
  IContentRoomLimited,
  IContentService,
  IContentStaffLimited,
  ICreateCaseContent,
  ICreateCustomCaseContent,
  IGetCaseContent,
  IGetContent,
  IRemoveUnusedContent
} from './interface'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { AboutTranslationService } from '../about_translation/aboutTranslationService'
import { RoomTranslationService } from '../room_translation/roomTranslationService'
import { StaffTranslationService } from '../staff_translation/staffTranslationService'
import { autoInjectable } from 'tsyringe'
import { TemplateService } from '../template/templateService'
import { AppDataSource } from '../../services/typeorm'
import { CaseService } from '../case/caseService'
import { IAboutImageLimited } from '../about/interface'
import { getSignedURL } from '../../services/google'
import { IRoomImageLimited } from '../room/interface'
import { IStaffImageLimited } from '../staff/interface'
import { AboutService } from '../about/aboutService'
import { RoomService } from '../room/roomService'
import { StaffService } from '../staff/staffService'

@autoInjectable()
export class ContentService implements IContentService {
  private readonly templateService: TemplateService
  private readonly aboutService: AboutService
  private readonly roomService: RoomService
  private readonly staffService: StaffService
  private readonly aboutTranslationService: AboutTranslationService
  private readonly roomTranslationService: RoomTranslationService
  private readonly staffTranslationService: StaffTranslationService
  private readonly caseService: CaseService

  constructor(
    caseService: CaseService,
    templateService: TemplateService,
    aboutService: AboutService,
    roomService: RoomService,
    staffService: StaffService,
    aboutTranslationService: AboutTranslationService,
    roomTranslationService: RoomTranslationService,
    staffTranslationService: StaffTranslationService
  ) {
    this.caseService = caseService
    this.templateService = templateService
    this.aboutService = aboutService
    this.roomService = roomService
    this.staffService = staffService
    this.aboutTranslationService = aboutTranslationService
    this.roomTranslationService = roomTranslationService
    this.staffTranslationService = staffTranslationService
  }

  getContent = async ({ languageId, barnahusId }: IGetContent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { aboutData, code: aboutDataCode } =
        await this.aboutTranslationService.getAboutTranslations({
          barnahusId,
          languageId,
          page: 1,
          limit: 1000
        })
      if (!aboutData) {
        return { code: aboutDataCode }
      }

      const contentAboutsLimited: IContentAboutLimited[] = await Promise.all(
        aboutData.aboutTranslations.map(async (aboutTranslation, index) => {
          const { aboutImages } = await this.aboutService.getAboutImages({
            aboutId: aboutTranslation.aboutId
          })

          return {
            aboutId: aboutTranslation.aboutId,
            orderNumber: index + 1,
            title: aboutTranslation.title || null,
            description: aboutTranslation.description || null,
            audio: aboutTranslation.audioId
              ? {
                  audioId: aboutTranslation.audioId,
                  audioURL:
                    (await getSignedURL(aboutTranslation.audio?.url)) || null,
                  audioName: aboutTranslation.audio?.name || null
                }
              : null,
            aboutImages
          }
        })
      )

      const { roomData, code: roomDataCode } =
        await this.roomTranslationService.getRoomTranslations({
          barnahusId,
          languageId,
          page: 1,
          limit: 1000
        })
      if (!roomData) {
        return { code: roomDataCode }
      }

      const contentRoomsLimited: IContentRoomLimited[] = await Promise.all(
        roomData.roomTranslations.map(async (roomTranslation, index) => {
          const { roomImages } = await this.roomService.getRoomImages({
            roomId: roomTranslation.roomId
          })

          return {
            roomId: roomTranslation.roomId,
            orderNumber: index + 1,
            title: roomTranslation.title || null,
            description: roomTranslation.description || null,
            audio: roomTranslation.audioId
              ? {
                  audioId: roomTranslation.audioId,
                  audioURL:
                    (await getSignedURL(roomTranslation.audio?.url)) || null,
                  audioName: roomTranslation.audio?.name || null
                }
              : null,
            roomImages
          }
        })
      )

      const { staffData, code: staffDataCode } =
        await this.staffTranslationService.getStaffTranslations({
          barnahusId,
          languageId,
          page: 1,
          limit: 1000
        })
      if (!staffData) {
        return { code: staffDataCode }
      }

      const contentStaffLimited: IContentStaffLimited[] = await Promise.all(
        staffData.staffTranslations.map(async (staffTranslationData, index) => {
          const { staffImages } = await this.staffService.getStaffImages({
            staffId: staffTranslationData.staffId
          })

          return {
            staffId: staffTranslationData.staffId,
            orderNumber: index + 1,
            name: staffTranslationData.staff.name || null,
            title: staffTranslationData.title || null,
            description: staffTranslationData.description || null,
            staffImages
          }
        })
      )

      return {
        content: {
          abouts: contentAboutsLimited,
          rooms: contentRoomsLimited,
          staff: contentStaffLimited
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

  createCaseContent = async ({
    caseId,
    languageId,
    templateId
  }: ICreateCaseContent) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      const { template, code: templateCode } =
        await this.templateService.getTemplate({ templateId })
      if (!template) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: templateCode }
      }

      await this.caseService.editCase({
        caseId,
        password: template.password,
        shouldChangePassword: template.isGeneral ? true : false
      })

      //About translation
      const aboutIds = template.abouts.map((about) => about.aboutId)
      const { aboutTranslations, code: aboutTranslationCode } =
        await this.aboutTranslationService.getAboutTranslationsByLanguageId({
          aboutIds,
          languageId
        })
      if (!aboutTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: aboutTranslationCode }
      }

      for (const [index, aboutTranslation] of aboutTranslations.entries()) {
        const about = template.abouts.find(
          (about) => about.aboutId === aboutTranslation.aboutId
        )
        if (!about) {
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseAbout({
            caseId,
            orderNumber: index,
            title: aboutTranslation.title,
            description: about.includeDescription
              ? aboutTranslation.description
              : undefined,
            audioId: about.includeAudio ? aboutTranslation.audioId : undefined,
            aboutImages: about.includeImages
              ? aboutTranslation.aboutImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      //Room translation
      const roomIds = template.rooms.map((room) => room.roomId)
      const { roomTranslations, code: roomTranslationCode } =
        await this.roomTranslationService.getRoomTranslationsByLanguageId({
          roomIds,
          languageId
        })
      if (!roomTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: roomTranslationCode }
      }

      for (const roomTranslation of roomTranslations) {
        const room = template.rooms.find(
          (room) => room.roomId === roomTranslation.roomId
        )
        if (!room) {
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseRoom({
            caseId,
            orderNumber: room.orderNumber,
            title: roomTranslation.title,
            description: room.includeDescription
              ? roomTranslation.description
              : undefined,
            audioId: room.includeAudio ? roomTranslation.audioId : undefined,
            roomImages: room.includeImages
              ? roomTranslation.roomImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      //Staff translation
      const staffIds = template.staff.map((staff) => staff.staffId)
      const { staffTranslations, code: staffTranslationCode } =
        await this.staffTranslationService.getStaffTranslationsByLanguageId({
          staffIds,
          languageId
        })
      if (!staffTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: staffTranslationCode }
      }

      for (const [index, staffTranslation] of staffTranslations.entries()) {
        const staff = template.staff.find(
          (staff) => staff.staffId === staffTranslation.staffId
        )
        if (!staff) {
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseStaff({
            caseId,
            orderNumber: index + 1,
            title: staff.includeName ? staffTranslation.title : undefined,
            name: staff.includeName ? staffTranslation.name : undefined,
            description: staff.includeDescription
              ? staffTranslation.description
              : undefined,
            staffImages: staff.includeImages
              ? staffTranslation.staffImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      const { code: setCaseContentCode } =
        await this.caseService.setCaseContent({
          caseId,
          languageId,
          templateId,
          queryRunner
        })

      if (setCaseContentCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: setCaseContentCode }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
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

  createCustomCaseContent = async ({
    caseId,
    languageId,
    rooms,
    abouts,
    staff: staffs
  }: ICreateCustomCaseContent) => {
    let code: ResponseCode = ResponseCode.OK
    const queryRunner = AppDataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()

      //About translation
      const aboutIds = abouts.map((about) => about.aboutId)
      const { aboutTranslations, code: aboutTranslationCode } =
        await this.aboutTranslationService.getAboutTranslationsByLanguageId({
          aboutIds,
          languageId
        })
      if (!aboutTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: aboutTranslationCode }
      }

      for (const [index, aboutTranslation] of aboutTranslations.entries()) {
        const about = abouts.find(
          (about) => about.aboutId === aboutTranslation.aboutId
        )
        if (!about) {
          continue
        }

        if (
          !about.includeAudio &&
          !about.includeDescription &&
          !about.includeImages
        ) {
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseAbout({
            caseId,
            orderNumber: index + 1,
            title: aboutTranslation.title,
            description: about.includeDescription
              ? aboutTranslation.description
              : undefined,
            audioId: about.includeAudio ? aboutTranslation.audioId : undefined,
            aboutImages: about.includeImages
              ? aboutTranslation.aboutImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      //Room translation
      const roomIds = rooms.map((room) => room.roomId)
      const { roomTranslations, code: roomTranslationCode } =
        await this.roomTranslationService.getRoomTranslationsByLanguageId({
          roomIds,
          languageId
        })
      if (!roomTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: roomTranslationCode }
      }

      for (const roomTranslation of roomTranslations) {
        const room = rooms.find(
          (room) => room.roomId === roomTranslation.roomId
        )
        if (!room) {
          continue
        }

        if (
          !room.includeAudio &&
          !room.includeDescription &&
          !room.includeImages
        ) {
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseRoom({
            caseId,
            orderNumber: room.orderNumber,
            title: roomTranslation.title,
            description: room.includeDescription
              ? roomTranslation.description
              : undefined,
            audioId: room.includeAudio ? roomTranslation.audioId : undefined,
            roomImages: room.includeImages
              ? roomTranslation.roomImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      //Staff translation
      const staffIds = staffs.map((staff) => staff.staffId)
      const { staffTranslations, code: staffTranslationCode } =
        await this.staffTranslationService.getStaffTranslationsByLanguageId({
          staffIds,
          languageId
        })
      if (!staffTranslations) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: staffTranslationCode }
      }

      for (const [index, staffTranslation] of staffTranslations.entries()) {
        const staff = staffs.find(
          (staff) => staff.staffId === staffTranslation.staffId
        )
        if (!staff) {
          continue
        }

        if (
          !staff.includeName &&
          !staff.includeDescription &&
          !staff.includeImages
        ) { 
          continue
        }

        const { code: createCaseAboutCode } =
          await this.caseService.createCaseStaff({
            caseId,
            orderNumber: index + 1,
            title: staff.includeName ? staffTranslation.title : undefined,
            name: staff.includeName ? staffTranslation.name : undefined,
            description: staff.includeDescription
              ? staffTranslation.description
              : undefined,
            staffImages: staff.includeImages
              ? staffTranslation.staffImages
              : undefined,
            queryRunner
          })

        if (createCaseAboutCode != ResponseCode.OK) {
          await queryRunner.rollbackTransaction()
          await queryRunner.release()
          return { code: createCaseAboutCode }
        }
      }

      const { code: setCaseContentCode } =
        await this.caseService.setCaseContent({
          caseId,
          languageId,
          queryRunner
        })

      if (setCaseContentCode != ResponseCode.OK) {
        await queryRunner.rollbackTransaction()
        await queryRunner.release()
        return { code: setCaseContentCode }
      }

      await queryRunner.commitTransaction()
      await queryRunner.release()
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

  getCaseContent = async ({ caseId }: IGetCaseContent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { caseAbouts, code: aboutCode } =
        await this.caseService.getCaseAbouts({ caseId })
      if (!caseAbouts) {
        return { code: aboutCode }
      }

      const contentAboutsLimited: IContentAboutLimited[] = await Promise.all(
        caseAbouts.map(async (caseAbout) => {
          let aboutImagesLimited: IAboutImageLimited[] = []
          for (let image of caseAbout.caseAboutImages) {
            aboutImagesLimited.push({
              aboutImageId: image.id,
              mediaId: image.mediaId,
              url: (await getSignedURL(image.media.url)) || image.media.url
            })
          }
          return {
            aboutId: caseAbout.id,
            orderNumber: caseAbout.orderNumber,
            title: caseAbout.title || null,
            description: caseAbout.description || null,
            audio: caseAbout.audioId
              ? {
                  audioId: caseAbout.audioId,
                  audioURL: (await getSignedURL(caseAbout.audio?.url)) || null,
                  audioName: caseAbout.audio?.name || null
                }
              : null,
            audioURL: (await getSignedURL(caseAbout.audio?.url)) || null,
            aboutImages: aboutImagesLimited
          }
        })
      )

      contentAboutsLimited.sort((a, b) => a.orderNumber - b.orderNumber)

      const { caseRooms, code: roomCode } = await this.caseService.getCaseRooms(
        { caseId }
      )
      if (!caseRooms) {
        return { code: roomCode }
      }

      const contentRoomsLimited: IContentRoomLimited[] = await Promise.all(
        caseRooms.map(async (caseRoom) => {
          let roomImagesLimited: IRoomImageLimited[] = []
          for (let image of caseRoom.caseRoomImages) {
            roomImagesLimited.push({
              roomImageId: image.id,
              mediaId: image.mediaId,
              url: (await getSignedURL(image.media.url)) || image.media.url
            })
          }
          return {
            roomId: caseRoom.id,
            orderNumber: caseRoom.orderNumber,
            title: caseRoom.title || null,
            description: caseRoom.description || null,
            audio: caseRoom.audioId
              ? {
                  audioId: caseRoom.audioId,
                  audioURL: (await getSignedURL(caseRoom.audio?.url)) || null,
                  audioName: caseRoom.audio?.name || null
                }
              : null,
            roomImages: roomImagesLimited
          }
        })
      )

      contentRoomsLimited.sort((a, b) => a.orderNumber - b.orderNumber)

      const { caseStaff, code: staffCode } =
        await this.caseService.getCaseStaff({ caseId })
      if (!caseStaff) {
        return { code: staffCode }
      }

      const contentStaffLimited: IContentStaffLimited[] = await Promise.all(
        caseStaff.map(async (caseStaffMember) => {
          let staffImagesLimited: IStaffImageLimited[] = []
          for (let image of caseStaffMember.caseStaffImages) {
            staffImagesLimited.push({
              staffImageId: image.id,
              mediaId: image.mediaId,
              url: (await getSignedURL(image.media.url)) || image.media.url
            })
          }
          return {
            staffId: caseStaffMember.id,
            orderNumber: caseStaffMember.orderNumber,
            name: caseStaffMember.name || null,
            title: caseStaffMember.title || null,
            description: caseStaffMember.description || null,
            staffImages: staffImagesLimited
          }
        })
      )

      contentStaffLimited.sort((a, b) => a.orderNumber - b.orderNumber)

      return {
        content: {
          abouts: contentAboutsLimited,
          rooms: contentRoomsLimited,
          staff: contentStaffLimited
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

  removeUnusedContent = async ({ barnahusId }: IRemoveUnusedContent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      await this.aboutService.removeUnusedAbouts({ barnahusId })

      await this.roomService.removeUnusedRooms({ barnahusId })

      await this.staffService.removeUnusedStaff({ barnahusId })

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
