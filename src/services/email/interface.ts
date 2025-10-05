import { EmailTemplates } from './templates'

export interface ISendEmail {
  to: string
  template: EmailTemplates
  data?: Record<string, any>
}

export interface ISendEmailOptions {
  to: string | string[]
  from: string
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface IEmailService {
  sendEmail(params: ISendEmail): Promise<void>
  sendRawEmail(options: ISendEmailOptions): Promise<void>
}
