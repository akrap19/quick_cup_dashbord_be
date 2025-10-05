import nodemailer from 'nodemailer'
import { ISendEmailOptions } from '../interface'
import { EmailTemplates } from '../templates'
import config from '../../../config'
import path from 'path'

export class SmtpProvider {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT || 587,
      secure: config.SMTP_SECURE || false,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: config.SMTP_TLS_REJECT_UNAUTHORIZED !== false
      }
    })
  }

  async sendEmail({
    to,
    template,
    data,
    from
  }: {
    to: string
    template: EmailTemplates
    data?: Record<string, any>
    from: string
  }): Promise<void> {
    const emailContent = await this.getEmailContent(template, data?.ROLE)
    const html = await this.renderTemplate(template, data)

    await this.sendRawEmail({
      to,
      from,
      subject: emailContent.subject,
      html
    })
  }

  async sendRawEmail(options: ISendEmailOptions): Promise<void> {
    try {
      const logoPath = path.join(__dirname, '../logo/QuickCup_logo.png')

      const attachments = [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo'
        },
        ...(options.attachments || [])
      ]

      await this.transporter.sendMail({
        from: options.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments
      })
    } catch (error) {
      throw new Error(`SMTP email sending failed: ${error}`)
    }
  }

  private async renderTemplate(
    template: EmailTemplates,
    data?: Record<string, any>
  ): Promise<string> {
    const emailContent = await this.getEmailContent(template, data?.ROLE)

    const defaultTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${emailContent.subject}</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <img src="cid:logo" alt="Quick Cup Dashboard" style="width: 112.5px; height: 78.75px; display: block; margin: 0 auto 20px;">
            <h2 style="text-align: center; margin: 0 0 20px 0; color: #black;">${emailContent.subject}</h2>
            <p style="text-align: center; margin: 0 0 30px 0; color: #333; line-height: 1.5; font-size: 14px;">${emailContent.description}</p>
            <div style="text-align: center;">
              <a href="${data?.URL}" style="display: inline-block; padding: 12px 24px; background-color: #ED9F2D; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">${emailContent.buttonText}</a>
            </div>
          </div>
        </body>
      </html>
    `

    return defaultTemplate
  }

  private async getEmailContent(
    template: EmailTemplates,
    role?: string
  ): Promise<{ subject: string; description: string; buttonText: string }> {
    const emailContent = {
      [EmailTemplates.INVITATION]: {
        subject: 'Invitation to Quick Cup Dashboard',
        description: `We are inviting you to join the Quick Cup Dashboard as a ${role}, please click the link below to register.`,
        buttonText: 'Register'
      },
      [EmailTemplates.EMAIL_CONFIRMATION]: {
        subject: 'Confirm Your Email Address',
        description:
          'Please confirm your email address by clicking the link below.',
        buttonText: 'Confirm'
      },
      [EmailTemplates.FORGOT_PASSWORD]: {
        subject: 'Reset Your Password',
        description: 'Please click the link below to reset your password.',
        buttonText: 'Reset'
      }
    }

    return (
      emailContent[template] || {
        subject: 'Email from Quick Cup Dashboard',
        description: 'Email from Quick Cup Dashboard',
        buttonText: 'Register'
      }
    )
  }
}
