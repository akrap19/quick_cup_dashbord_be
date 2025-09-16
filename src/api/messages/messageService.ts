import { ResponseCode } from '../../interface'
import { IGetDynamicMessage, IMessageService } from './interface'
import { getResponseMessage } from '../../services/utils'
import { logger } from '../../logger'
import { Repository } from 'typeorm'
import { DynamicMessages } from './messageModel'
import { AppDataSource } from '../../services/typeorm'
import { autoInjectable } from 'tsyringe'

@autoInjectable()
export class MessageService implements IMessageService {
  private readonly dynamicMessageRepository: Repository<DynamicMessages>

  constructor() {
    this.dynamicMessageRepository =
      AppDataSource.manager.getRepository(DynamicMessages)
  }

  getDynamicMessageBySlug = async ({ slug }: IGetDynamicMessage) => {
    let code = ResponseCode.OK

    try {
      const message = await this.dynamicMessageRepository.findOne({
        where: { slug }
      })
      if (!message) {
        return { code: ResponseCode.DYNAMIC_MESSAGE_NOT_FOUND }
      }

      return { message, code }
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
