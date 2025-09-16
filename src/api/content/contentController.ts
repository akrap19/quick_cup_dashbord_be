import { NextFunction, Request, Response } from 'express'
import { ContentService } from './contentService'
import { autoInjectable } from 'tsyringe'
import { LanguageService } from '../language/languageService'
import { CaseService } from '../case/caseService'
import { UserRoleBarnahusService } from '../user_role_barnahus/userRoleBarnahusService'
import { RoleType } from '../role/interface'
import { LanguageStatus } from '../language/interface'
import { BarnahusService } from '../barnahus/barnahusService'
import { ResponseCode } from '../../interface'
import { NoteService } from '../note/noteService'
import { LoginType } from '../user_session/interface'

@autoInjectable()
export class ContentController {
  private readonly contentService: ContentService
  private readonly languageService: LanguageService
  private readonly barnahusService: BarnahusService
  private readonly caseService: CaseService
  private readonly noteService: NoteService
  private readonly userRoleBarnahusService: UserRoleBarnahusService

  constructor(
    contentService: ContentService,
    languageService: LanguageService,
    barnahusService: BarnahusService,
    caseService: CaseService,
    noteService: NoteService,
    userRoleBarnahusService: UserRoleBarnahusService
  ) {
    this.contentService = contentService
    this.languageService = languageService
    this.barnahusService = barnahusService
    this.caseService = caseService
    this.noteService = noteService
    this.userRoleBarnahusService = userRoleBarnahusService
  }

  getContent = async (req: Request, res: Response, next: NextFunction) => {
    let { languageId } = res.locals.input
    const { barnahusId } = req.user

    const { content, code } = await this.contentService.getContent({
      barnahusId,
      languageId
    })

    return next({
      data: content,
      code
    })
  }

  getTemplateContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { barnahusId } = req.user

    const { defaultLanguage, code: defaultLanguageCode } =
      await this.languageService.getDefaultLanguage({ barnahusId })
    if (!defaultLanguage) {
      return next({ code: defaultLanguageCode })
    }

    const { content, code } = await this.contentService.getContent({
      barnahusId,
      languageId: defaultLanguage.id
    })

    return next({
      data: content,
      code
    })
  }

  getCases = async (req: Request, res: Response, next: NextFunction) => {
    const { search } = res.locals.input
    const { barnahusId, loginType } = req.user
    const { caseData, code } = await this.caseService.getCases({
      barnahusId,
      page: 1,
      limit: 1000,
      search
    })

    if (!caseData) {
      return next({ code })
    }

    let cases = caseData.cases.map((x) => {
      return {
        caseId: x.id,
        customId: x.customId,
        language: x.language ? x.language.name : null,
        canAddNotes: x.canAddNotes
      }
    })

    if (loginType === LoginType.MOBILE) {
      cases = cases.filter((x) => x.language)
    }

    return next({ data: { cases }, code })
  }

  getBarnahuses = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user

    const { userBarnahusRoles, code } =
      await this.userRoleBarnahusService.getUserRoleBarnahusesByUserRole({
        userId: id,
        roleName: [RoleType.PRACTITIONER]
      })

    if (!userBarnahusRoles) {
      return next({ code })
    }

    const barnahuses = userBarnahusRoles.map((roleObject) => {
      return {
        barnahusId: roleObject.barnahusId,
        locationCode: roleObject.barnahus.locationCode
      }
    })

    return next({ data: barnahuses, code })
  }

  getBarnahusContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { locationCode, languageId } = res.locals.input

    const { barnahus, code: barnahusCode } =
      await this.barnahusService.getBarnahusByLocationCode({ locationCode })
    if (!barnahus) {
      return next({ code: barnahusCode })
    }

    const { content, code } = await this.contentService.getContent({
      barnahusId: barnahus.id,
      languageId
    })

    return next({
      data: content,
      code
    })
  }

  getLanguages = async (req: Request, res: Response, next: NextFunction) => {
    const { locationCode } = res.locals.input

    const { barnahus, code: barnahusCode } =
      await this.barnahusService.getBarnahusByLocationCode({ locationCode })

    if (!barnahus) {
      return next({ code: barnahusCode })
    }

    const { languagesData, code: languageCode } =
      await this.languageService.getLanguages({
        status: LanguageStatus.PUBLISHED,
        page: 1,
        limit: 1000,
        barnahusId: barnahus.id
      })
    if (!languagesData) {
      return next({ code: languageCode })
    }

    let languages = languagesData.languages.map((language) => {
      return { languageId: language.id, name: language.name }
    })

    return next({ data: { languages }, code: ResponseCode.OK })
  }

  setCaseContent = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId, languageId, templateId } = res.locals.input

    const { code } = await this.contentService.createCaseContent({
      caseId,
      templateId,
      languageId
    })

    return next({ code })
  }

  setCustomCaseContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { caseId, languageId, rooms, abouts, staff } = res.locals.input

    const { code } = await this.contentService.createCustomCaseContent({
      caseId,
      rooms,
      abouts,
      staff,
      languageId
    })

    return next({ code })
  }

  getCaseContentByLoginId = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user

    const { case: userCase, code: caseCode } = await this.caseService.getCase({
      caseId: id
    })

    if (!userCase) {
      return next({ code: caseCode })
    }

    const { content, code: contentCode } =
      await this.contentService.getCaseContent({
        caseId: id
      })
    if (!content) {
      return next({ code: contentCode })
    }

    return next({
      data: { content, canAddNotes: userCase?.canAddNotes },
      code: ResponseCode.OK
    })
  }

  getCaseContent = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId } = res.locals.input

    const { content, code: contentCode } =
      await this.contentService.getCaseContent({
        caseId
      })
    if (!content) {
      return next({ code: contentCode })
    }

    return next({ data: { content }, code: ResponseCode.OK })
  }

  createNote = async (req: Request, res: Response, next: NextFunction) => {
    const { contentId, type, note } = res.locals.input

    const { canAddNotes } = await this.caseService.checkCanAddNotes({
      contentId,
      type
    })

    if (!canAddNotes) {
      return next({ code: ResponseCode.CANNOT_ADD_NOTE })
    }

    const { code } = await this.noteService.createNote({
      contentId,
      type,
      note
    })

    return next({ code })
  }

  getNotes = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user

    const { case: caseObject, code: caseCode } = await this.caseService.getCase(
      { caseId: id }
    )
    if (!caseObject) {
      return next({ code: caseCode })
    }

    const { notesLimited, code } = await this.noteService.getNotes({
      caseId: caseObject.id
    })

    return next({ data: { notes: notesLimited }, code })
  }

  deleteNotes = async (req: Request, res: Response, next: NextFunction) => {
    const { customId, aboutNotes, roomNotes, staffNotes } = res.locals.input

    const { case: caseObject, code: caseCode } =
      await this.caseService.getCaseByCustomId({ customId })
    if (!caseObject) {
      return next({ code: caseCode })
    }

    const { code } = await this.noteService.deleteNotes({
      caseId: caseObject.id,
      aboutNotes,
      roomNotes,
      staffNotes
    })

    return next({ code })
  }

  checkCanAddNotes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user

    const { case: userCase, code } = await this.caseService.getCase({
      caseId: id
    })
    if (!userCase) {
      return next({ code })
    }

    return next({
      data: { canAddNotes: userCase.canAddNotes },
      code: ResponseCode.OK
    })
  }

  
  editNote = async (req: Request, res: Response, next: NextFunction) => {
    const { noteId, type, note } = res.locals.input

    const { code } = await this.noteService.editNote({
      noteId,
      type,
      note
    })

    return next({ code })
  }
}
