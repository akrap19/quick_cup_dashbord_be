import { ResponseCode } from '../../interface'
import { IVoiceoverService, IGetVoiceover } from './interface'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { autoInjectable } from 'tsyringe'
import { MediaService } from '../media/mediaService'

@autoInjectable()
export class VoiceoverService implements IVoiceoverService {
  constructor(private readonly mediaService: MediaService) {}

  getVoiceover = async ({ language, name }: IGetVoiceover) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const voiceoverName = `${name}_${language}.mp3`

      const { media, code: mediaCode } = await this.mediaService.getMediaByName(
        { name: voiceoverName }
      )
      if (!media) {
        return { code: mediaCode }
      }

      const voiceover = media.url

      return { voiceover, code }
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
