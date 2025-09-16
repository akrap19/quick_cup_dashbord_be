import { NextFunction, Request, Response } from 'express'
import { ITemplateLimited, ITemplatesPaginationLimited } from './interface'
import { TemplateService } from './templateService'
import { autoInjectable } from 'tsyringe'
import { ResponseCode } from '../../interface'
import { UserStatus } from '../user/interface'

@autoInjectable()
export class TemplateController {
  private readonly templateService: TemplateService

  constructor(templateService: TemplateService) {
    this.templateService = templateService
  }

  addTemplate = async (req: Request, res: Response, next: NextFunction) => {
    const { name, isGeneral, password, rooms, abouts, staff } = res.locals.input
    const { barnahusId, id } = req.user

    if (isGeneral || password) {
      if (!isGeneral && !password) {
        return next({ code: ResponseCode.PASSWORD_NOT_PROVIDED })
      }
    }

    const { code } = await this.templateService.createTemplate({
      barnahusId,
      name,
      isGeneral,
      password,
      rooms,
      abouts,
      staff,
      addedById: id
    })

    return next({ code })
  }

  getTemplates = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, search } = res.locals.input
    const { barnahusId } = req.user

    const { templateData, code } = await this.templateService.getTemplates({
      page,
      limit,
      search,
      barnahusId
    })

    if (templateData) {
      const templatesLimited: ITemplateLimited[] = templateData.templates.map(
        (x) => {
          return {
            templateId: x.id,
            name: x.name,
            isGeneral: x.isGeneral,
            password: x.password || null,
            status: x.status,
            updated: x.updatedAt,
            hasCases: x.cases?.length > 0,
            addedBy: x.addedBy
              ? `${x.addedBy.firstName} ${x.addedBy.lastName} ${x.addedBy.status == UserStatus.DELETED ? '[deleted]' : ''}`
              : null
          }
        }
      )

      let templatesLimitedData: ITemplatesPaginationLimited = {
        pagination: templateData.pagination,
        templates: templatesLimited
      }

      return next({ data: templatesLimitedData, code })
    }

    return next({ code })
  }

  getTemplate = async (req: Request, res: Response, next: NextFunction) => {
    const { templateId } = res.locals.input

    const { template, code } = await this.templateService.getTemplate({
      templateId
    })

    if (!template) {
      return next({ code })
    }

    return next({ data: { template }, code })
  }

  editTemplate = async (req: Request, res: Response, next: NextFunction) => {
    const {
      templateId,
      name,
      isGeneral,
      abouts,
      rooms,
      staff,
      deleteAbouts,
      deleteRooms,
      deleteStaff
    } = res.locals.input

    const { code } = await this.templateService.editTemplate({
      templateId,
      name,
      isGeneral,
      rooms,
      abouts,
      staff,
      deleteAbouts,
      deleteRooms,
      deleteStaff
    })

    return next({ code })
  }

  deleteTemplate = async (req: Request, res: Response, next: NextFunction) => {
    const { templateId } = res.locals.input

    const { code } = await this.templateService.deleteTemplate({
      templateId
    })

    return next({ code })
  }

  bulkDeleteTemplates = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { templateIds } = res.locals.input

    const { code } = await this.templateService.bulkDeleteTemplates({
      templateIds
    })

    return next({ code })
  }

  checkTemplateAvailable = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = res.locals.input

    const { template } = await this.templateService.getTemplateByName({
      name
    })

    return next({
      data: { available: template ? false : true },
      code: ResponseCode.OK
    })
  }
}
