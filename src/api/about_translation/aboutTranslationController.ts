import { NextFunction, Request, Response } from 'express'
import { AboutTranslationService } from './aboutTranslationService'
import { ResponseCode } from '../../interface'
import { AboutService } from '../about/aboutService'
import { LanguageService } from '../language/languageService'
import { AboutTranslation } from './aboutTranslationModel'
import { AboutStatus, IAboutTranslationLimited } from './interface'
import { autoInjectable } from 'tsyringe'
import { MediaService } from '../media/mediaService'
import { LanguageStatus } from '../language/interface'

@autoInjectable()
export class AboutTranslationController {
  private readonly aboutTranslationService: AboutTranslationService
  private readonly aboutService: AboutService
  private readonly languageService: LanguageService

  constructor(
    aboutTranslationService: AboutTranslationService,
    aboutService: AboutService,
    languageService: LanguageService
  ) {
    this.aboutTranslationService = aboutTranslationService
    this.aboutService = aboutService
    this.languageService = languageService
  }

  translateAbout = async (req: Request, res: Response, next: NextFunction) => {
    let {
      aboutId,
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

    const { code } = await this.aboutTranslationService.createAboutTranslation({
      aboutId,
      languageId,
      title,
      description,
      audioId,
      barnahusId,
      images,
      deletedImages,
      status:
        language.status == LanguageStatus.PUBLISHED
          ? AboutStatus.PUBLISHED
          : AboutStatus.DRAFT
    })

    await this.languageService.checkLanguageStatus({
      barnahusId,
      languageId
    })

    return next({ code })
  }

  getAboutTranslations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { languageId, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { aboutData, code } =
      await this.aboutTranslationService.getAboutTranslations({
        barnahusId,
        languageId,
        page,
        limit
      })
    if (!aboutData) {
      return next({ code })
    }

    const aboutTranslationsLimited: IAboutTranslationLimited[] =
      aboutData.aboutTranslations.map((aboutTranslation) => {
        let about = aboutTranslation.about

        return {
          aboutId: about.id,
          aboutTranslationId: aboutTranslation.id,
          name: aboutTranslation.title,
          updated: aboutTranslation.updatedAt,
          status: aboutTranslation.status
        }
      })

    return next({
      data: {
        pagination: aboutData.pagination,
        abouts: aboutTranslationsLimited
      },
      code
    })
  }

  getAboutTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { aboutTranslationId } = res.locals.input

    const { aboutTranslation, code } =
      await this.aboutTranslationService.getAboutTranslation({
        aboutTranslationId
      })
    if (!aboutTranslation) {
      return next({ code })
    }

    return next({
      data: {
        aboutTranslation
      },
      code
    })
  }

  editAboutTranslation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { barnahusId } = req.user
    const {
      aboutTranslationId,
      title,
      description,
      audioId,
      images,
      deletedImages
    } = res.locals.input

    const { aboutTranslation, code: aboutTranslationCode } =
      await this.aboutTranslationService.getAboutTranslation({
        aboutTranslationId
      })
    if (!aboutTranslation) {
      return next({ code: aboutTranslationCode })
    }

    const { code } = await this.aboutTranslationService.editAboutTranslation({
      aboutTranslation,
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
      barnahusId: barnahusId,
      languageId: aboutTranslation.languageId
    })

    return next({ code })
  }

  deleteAbout = async (req: Request, res: Response, next: NextFunction) => {
    const { aboutId } = res.locals.input

    const { code } = await this.aboutService.deleteAbout({
      aboutId
    })

    return next({ code })
  }

  bulkDeleteAbouts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { aboutIds } = res.locals.input

    const { code } = await this.aboutService.bulkDeleteAbouts({
      aboutIds
    })

    return next({ code })
  }

  bulkTranslateAbouts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { translations } = res.locals.input
    const { barnahusId } = req.user

    const { code } =
      await this.aboutTranslationService.bulkCreateAboutTranslation({
        barnahusId,
        translations
      })

    await this.languageService.checkLanguageStatus({
      barnahusId: barnahusId,
      languageId: translations[0].languageId
    })

    return next({ code })
  }

  fullTranslateAbout = async (
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
        limit: 1000,
        status: LanguageStatus.PUBLISHED
      })
    if (!languagesData) {
      return next({ code: languageCode })
    }

    for (let language of languagesData.languages) {
      let translationIndex = translations.findIndex(
        (translation: AboutTranslation) => translation.languageId == language.id
      )
      if (translationIndex == -1) {
        return next({ code: ResponseCode.ALL_LANGUAGES_REQUIRED })
      }

      translations[translationIndex].status = language.status
    }

    const { code } =
      await this.aboutTranslationService.createFullAboutTranslations({
        barnahusId,
        translations,
        images,
        deletedImages
      })

    return next({ code })
  }
}
