import { NextFunction, Request, Response } from 'express'
import { LanguageService } from './languageService'
import {
  ILanguageLimited,
  ILanguagesPaginationLimited,
  LanguageStatus
} from './interface'
import { ResponseCode } from '../../interface'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class LanguageController {
  private readonly languageService: LanguageService

  constructor(languageService: LanguageService) {
    this.languageService = languageService
  }

  addLanguage = async (req: Request, res: Response, next: NextFunction) => {
    const { code: languageCode, name, autoTranslate } = res.locals.input
    const admin = req.user

    const { code } = await this.languageService.createLanguage({
      name,
      autoTranslate,
      languageCode,
      barnahusId: admin.barnahusId
    })

    return next({ code })
  }

  getLanguages = async (req: Request, res: Response, next: NextFunction) => {
    const { status, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { languagesData, code } = await this.languageService.getLanguages({
      status,
      page,
      limit,
      barnahusId
    })

    if (languagesData) {
      const languagesLimited: ILanguageLimited[] = languagesData.languages.map(
        (x) => {
          return {
            languageId: x.id,
            name: x.name,
            status: x.status,
            autoTranslate: x.autoTranslate,
            translateable: x.translateable && x.status != LanguageStatus.HIDDEN,
            isDefault: x.isDefault,
            hasCases: x.cases?.length > 0
          }
        }
      )

      let languagesLimitedData: ILanguagesPaginationLimited = {
        pagination: languagesData.pagination,
        languages: languagesLimited
      }

      return next({ data: languagesLimitedData, code })
    }

    return next({ code })
  }

  searchLanguages = async (req: Request, res: Response, next: NextFunction) => {
    const { search, status } = res.locals.input
    const { barnahusId } = req.user

    const { languages, code } = await this.languageService.searchLanguages({
      search,
      status,
      barnahusId
    })

    if (languages) {
      const languagesLimited = languages.map((x) => {
        return {
          languageId: x.id,
          name: x.name,
          status: x.status,
          autoTranslate: x.autoTranslate,
          translateable: x.translateable && x.status != LanguageStatus.DRAFT,
          isDefault: x.isDefault
        }
      })

      return next({ data: { languages: languagesLimited }, code })
    }

    return next({ code })
  }

  getLanguage = async (req: Request, res: Response, next: NextFunction) => {
    const { languageId } = res.locals.input

    const { language, code } = await this.languageService.getLanguage({
      languageId
    })
    if (!language) {
      return next({ code })
    }

    let languageLimited: ILanguageLimited = {
      languageId: language.id,
      name: language.name,
      status: language.status,
      autoTranslate: language.autoTranslate,
      translateable:
        language.translateable && language.status != LanguageStatus.DRAFT,
      isDefault: language.isDefault,
      hasCases: language.cases?.length > 0
    }

    return next({ data: { language: languageLimited }, code })
  }

  searchSupportedLanguages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { search } = res.locals.input

    if (!search || search.length < 3) {
      return next({ data: { languages: [] }, code: ResponseCode.OK })
    }

    const { languages, code } =
      await this.languageService.searchSupportedLanguages({ search })

    return next({ data: { languages }, code })
  }

  editLanguage = async (req: Request, res: Response, next: NextFunction) => {
    const { languageId, name, autoTranslate, status } = res.locals.input

    const { code } = await this.languageService.editLanguage({
      languageId,
      name,
      autoTranslate,
      status
    })

    return next({ code })
  }

  deleteLanguage = async (req: Request, res: Response, next: NextFunction) => {
    const { languageId } = res.locals.input

    const { code } = await this.languageService.deleteLanguage({
      languageId
    })

    return next({ code })
  }

  bulkDeleteLanguages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { languageIds } = res.locals.input
    const { barnahusId } = req.user

    const { errors, code } = await this.languageService.bulkDeleteLanguages({
      languageIds,
      barnahusId
    })

    return next({ data: { errors }, code })
  }

  canPublishLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { languageId } = res.locals.input
    const { barnahusId } = req.user

    const { publishable, code } =
      await this.languageService.checkLanguagePublishable({
        languageId,
        barnahusId
      })

    return next({ data: { publishable }, code })
  }

  publishLanguage = async (req: Request, res: Response, next: NextFunction) => {
    const { languageId } = res.locals.input
    const { barnahusId } = req.user

    const { publishable } = await this.languageService.checkLanguagePublishable(
      {
        languageId,
        barnahusId
      }
    )

    if (!publishable) {
      return next({ code: ResponseCode.LANGUAGE_NOT_PUBLISHABLE })
    }

    const { code } = await this.languageService.publishLanguage({
      languageId,
      barnahusId
    })

    return next({ code })
  }

  autoTranslate = async (req: Request, res: Response, next: NextFunction) => {
    const { languageId } = res.locals.input
    const { barnahusId } = req.user

    const { translation, code } = await this.languageService.autoTranslate({
      languageId,
      barnahusId
    })

    return next({ data: translation, code })
  }

  translateContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { languageId, content } = res.locals.input

    const { translation, code } = await this.languageService.translateContent({
      languageId,
      content
    })

    return next({ data: { translation }, code })
  }

  setDefaultLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { languageId } = res.locals.input
    const { barnahusId } = req.user

    const { code } = await this.languageService.setDefaultLanguage({
      languageId,
      barnahusId
    })

    return next({ code })
  }
}
