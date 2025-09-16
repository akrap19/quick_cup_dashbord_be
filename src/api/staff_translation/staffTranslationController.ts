import { NextFunction, Request, Response } from 'express'
import { ResponseCode } from '../../interface'
import { StaffTranslationService } from './staffTranslationService'
import { StaffService } from '../staff/staffService'
import { LanguageService } from '../language/languageService'
import { StaffTranslation } from './staffTranslationModel'
import { IStaffTranslationLimited, StaffStatus } from './interface'
import { autoInjectable } from 'tsyringe'
import { LanguageStatus } from '../language/interface'

@autoInjectable()
export class StaffTranslationController {
  private readonly staffTranslationService: StaffTranslationService
  private readonly staffService: StaffService
  private readonly languageService: LanguageService

  constructor(
    staffTranslationService: StaffTranslationService,
    staffService: StaffService,
    languageService: LanguageService
  ) {
    this.staffTranslationService = staffTranslationService
    this.staffService = staffService
    this.languageService = languageService
  }

  translateStaff = async (req: Request, res: Response, next: NextFunction) => {
    let {
      staffId,
      languageId,
      name,
      title,
      description,
      images,
      deletedImages
    } = res.locals.input
    const { barnahusId } = req.user

    const { language, code: languageCode } =
      await this.languageService.getLanguage({
        languageId
      })
    if (!language) {
      return next({ code: languageCode })
    }

    await this.staffTranslationService.createStaffTranslation({
      staffId,
      languageId,
      title,
      name,
      description,
      barnahusId,
      images,
      deletedImages,
      status:
        language.status == LanguageStatus.PUBLISHED
          ? StaffStatus.PUBLISHED
          : StaffStatus.DRAFT
    })

    return next({ staffId, code: ResponseCode.OK })
  }

  getStaffTranslations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { languageId, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { staffData, code } =
      await this.staffTranslationService.getStaffTranslations({
        barnahusId,
        languageId,
        page,
        limit
      })
    if (!staffData) {
      return next({ code })
    }

    const staffTranslationsLimited: IStaffTranslationLimited[] =
      staffData.staffTranslations.map((translation) => {
        let staff = translation.staff

        return {
          staffId: staff.id,
          staffTranslationId: translation.id,
          name: staff.name,
          updated: translation.updatedAt,
          status: translation.status
        }
      })

    return next({
      data: {
        pagination: staffData.pagination,
        staff: staffTranslationsLimited
      },
      code
    })
  }

  getStaffTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { staffTranslationId } = res.locals.input

    const { staffTranslation, code } =
      await this.staffTranslationService.getStaffTranslation({
        staffTranslationId
      })
    if (!staffTranslation) {
      return next({ code })
    }

    return next({
      data: {
        staffTranslation
      },
      code
    })
  }

  editStaffTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {
      staffTranslationId,
      title,
      name,
      description,
      images,
      deletedImages
    } = res.locals.input

    const { staffTranslation, code: staffTranslationCode } =
      await this.staffTranslationService.getStaffTranslation({
        staffTranslationId
      })
    if (!staffTranslation) {
      return next({ code: staffTranslationCode })
    }

    const { code } = await this.staffTranslationService.editStaffTranslation({
      staffTranslation,
      title,
      name,
      description,
      images,
      deletedImages
    })
    if (code !== ResponseCode.OK) {
      return next({ code })
    }

    return next({ code })
  }

  deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
    const { staffId } = res.locals.input

    const { code } = await this.staffService.deleteStaff({
      staffId
    })

    return next({ code })
  }

  bulkDeleteStaff = async (req: Request, res: Response, next: NextFunction) => {
    const { staffIds } = res.locals.input

    const { code } = await this.staffService.bulkDeleteStaff({
      staffIds
    })

    return next({ code })
  }

  bulkTranslateStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { translations } = res.locals.input
    const { barnahusId } = req.user

    const { code } =
      await this.staffTranslationService.bulkCreateStaffTranslation({
        barnahusId,
        translations
      })

    await this.languageService.checkLanguageStatus({
      barnahusId: barnahusId,
      languageId: translations[0].languageId
    })

    return next({ code })
  }

  fullTranslateStaff = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { name, translations, images, deletedImages } = res.locals.input
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
        (translation: StaffTranslation) => translation.languageId == language.id
      )
      if (translationIndex == -1) {
        return next({ code: ResponseCode.ALL_LANGUAGES_REQUIRED })
      }

      translations[translationIndex].status = language.status
    }

    const { code } =
      await this.staffTranslationService.createFullStaffTranslations({
        barnahusId,
        name,
        translations,
        images,
        deletedImages
      })

    return next({ code })
  }
}
