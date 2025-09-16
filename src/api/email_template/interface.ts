import { AsyncResponse } from "../../interface"

export enum EmailTemplates {
  INVITATION = 'invitation',
  EMAIL_CONFIRMATION = 'email_confirmation',
  BARNAHUS_ASSIGNMENT = 'barnahus_assignment',
  FORGOT_PASSWORD = 'forgot_password'
}

export interface IGetTemplateId {
  template: EmailTemplates
}

export interface ISendEmail {
  to: string
  template: EmailTemplates
  data?: Object
}

export interface IEmailTemplateService {
  getTemplateId(params: IGetTemplateId): AsyncResponse<string>
  sendEmail(params: ISendEmail): AsyncResponse<null>
}
