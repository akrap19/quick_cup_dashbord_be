import { SmtpProvider } from './providers/smtp'
import { logger } from '../../logger'
import { ResponseCode } from '../../interface'
import { IEmailService, ISendEmail, ISendEmailOptions } from './interface'

export class EmailService implements IEmailService {
  private provider: SmtpProvider

  constructor() {
    this.provider = new SmtpProvider()
  }

  async sendEmail({ to, template, data }: ISendEmail): Promise<void> {
    try {
      await this.provider.sendEmail({
        to,
        template,
        data,
        from: process.env.SENDER_EMAIL_ADDRESS || 'noreply@example.com'
      })

      logger.info(`Email sent successfully to ${to} using template ${template}`)
    } catch (error: any) {
      logger.error({
        code: ResponseCode.FAILED_DEPENDENCY,
        message: `Failed to send email: ${error.message}`,
        stack: error.stack
      })
      throw error
    }
  }

  async sendRawEmail(options: ISendEmailOptions): Promise<void> {
    try {
      await this.provider.sendRawEmail(options)

      logger.info(`Raw email sent successfully to ${options.to}`)
    } catch (error: any) {
      logger.error({
        code: ResponseCode.FAILED_DEPENDENCY,
        message: `Failed to send raw email: ${error.message}`,
        stack: error.stack
      })
      throw error
    }
  }
}

// Default email service instance
export const emailService = new EmailService()
