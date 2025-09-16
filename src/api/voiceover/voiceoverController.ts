import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { VoiceoverService } from './voiceoverService'

@autoInjectable()
export class VoiceoverController {
  constructor(private readonly voiceoverService: VoiceoverService) {}

  getVoiceover = async (req: Request, res: Response, next: NextFunction) => {
    const { name, language } = res.locals.input

    const { voiceover, code } = await this.voiceoverService.getVoiceover({
      name,
      language
    })

    return next({ data: { url: voiceover }, code })
  }
}
