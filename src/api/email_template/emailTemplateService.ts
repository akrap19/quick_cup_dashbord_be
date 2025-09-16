import { Repository } from 'typeorm'
import { AppDataSource } from '../../services/typeorm'
import { IEmailTemplateService, IGetTemplateId, ISendEmail } from './interface'
import { ResponseCode } from '../../interface'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { EmailTemplate } from './emailTemplateModel'
import { sendEmail } from '../../services/sendgrid'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class EmailTemplateService implements IEmailTemplateService {
  private readonly emailTemplateRepository: Repository<EmailTemplate>

  constructor() {
    this.emailTemplateRepository =
      AppDataSource.manager.getRepository(EmailTemplate)
  }

  getTemplateId = async ({ template }: IGetTemplateId) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const emailTemplate = await this.emailTemplateRepository.findOne({
        where: { name: template }
      })
      if (!emailTemplate) {
        return { code: ResponseCode.USER_NOT_FOUND }
      }

      return {
        templateId: emailTemplate.templateId,
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

  sendEmail = async ({ to, template, data }: ISendEmail) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const { templateId, code: templateCode } = await this.getTemplateId({
        template
      })
      if (!templateId) {
        return { code: templateCode }
      }

      await sendEmail({ to, templateId, data })

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
}
