import { NextFunction, Request, Response } from 'express'
import { CaseStatus, ICaseLimited } from './interface'
import { CaseService } from './caseService'
import { autoInjectable } from 'tsyringe'
import { ResponseCode } from '../../interface'

@autoInjectable()
export class CaseController {
  private readonly caseService: CaseService

  constructor(caseService: CaseService) {
    this.caseService = caseService
  }

  addCase = async (req: Request, res: Response, next: NextFunction) => {
    const { customId, canAddNotes, password } = res.locals.input
    const { barnahusId } = req.user

    const { caseId, code: caseCode } = await this.caseService.createCase({
      customId,
      barnahusId,
      status: CaseStatus.OPEN,
      canAddNotes,
      shouldChangePassword: password ? false : true,
      password
    })

    return next({ data: { caseId }, code: caseCode })
  }

  getCases = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input
    const { barnahusId } = req.user

    const { caseData, code } = await this.caseService.getCases({
      barnahusId,
      search,
      page,
      limit
    })

    if (caseData) {
      const casesLimited: ICaseLimited[] = caseData.cases.map((x) => {
        return {
          caseId: x.id,
          customId: x.customId,
          barnahus: `${x.barnahus.name} (${x.barnahus.locationCode})`,
          template: x.template?.name || null,
          language: x.language?.name || null,
          canAddNotes: x.canAddNotes,
          status: x.status,
          updatedAt: x.updatedAt
        }
      })

      let casesLimitedData = {
        pagination: caseData.pagination,
        cases: casesLimited
      }

      return next({ data: casesLimitedData, code })
    }

    return next({ code })
  }

  searchCases = async (req: Request, res: Response, next: NextFunction) => {
    const { search, status } = res.locals.input
    const { barnahusId } = req.user

    const { cases, code } = await this.caseService.searchCases({
      barnahusId,
      search,
      status
    })

    if (cases) {
      const casesLimited = cases.map((x) => {
        return {
          caseId: x.id,
          customId: x.customId
        }
      })

      return next({ data: casesLimited, code })
    }

    return next({ code })
  }

  getCase = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId } = res.locals.input

    const { case: fetchedCase, code } = await this.caseService.getCase({
      caseId
    })

    if (!fetchedCase) {
      return next({ code })
    }

    let caseLimited = {
      caseId: fetchedCase.id,
      customId: fetchedCase.customId,
      barnahusId: fetchedCase.barnahus.locationCode,
      barnahusLocation: fetchedCase.barnahus.location,
      template: fetchedCase.template?.name || null,
      language: fetchedCase.language?.name || null,
      canAddNotes: fetchedCase.canAddNotes,
      status: fetchedCase.status
    }

    return next({ data: { case: caseLimited }, code })
  }

  editCase = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId, customId, canAddNotes, password } = res.locals.input

    const { code } = await this.caseService.editCase({
      caseId,
      customId,
      canAddNotes,
      password
    })

    return next({ code })
  }

  deleteCase = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId } = res.locals.input

    const { code } = await this.caseService.deleteCase({
      caseId
    })

    return next({ code })
  }

  bulkDeleteCases = async (req: Request, res: Response, next: NextFunction) => {
    const { caseIds } = res.locals.input

    const { code } = await this.caseService.bulkDeleteCases({
      caseIds
    })

    return next({ code })
  }

  changeCasePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user
    const { password, newPassword } = res.locals.input

    const { code } = await this.caseService.changeCasePassword({
      caseId: id,
      password,
      newPassword
    })

    return next({ code })
  }

  checkCustomIdAvailable = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { customId } = res.locals.input

    const { case: existingCase, code } =
      await this.caseService.getCaseByCustomId({
        customId
      })

    return next({ data: { available: existingCase ? false : true }, code: ResponseCode.OK })
  }
}
