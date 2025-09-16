import sendgrid from '@sendgrid/mail'
import config from '../../config'
import { ISendEmail } from './interface'
import { logger } from '../../logger'
import { ResponseCode } from '../../interface'

sendgrid.setApiKey(config.SENDGRID_API_KEY)

export const sendEmail = async ({ to, templateId, data }: ISendEmail) => {
  try {
    const response = await sendgrid.send({
      to,
      from: config.SENDER_EMAIL_ADDRESS,
      templateId,
      dynamicTemplateData: data
    }) 

    logger.info(response)
  } catch(err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: err,
      stack: err.stack
    })
  }
}
