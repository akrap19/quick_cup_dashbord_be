import { AsyncResponse } from '../../interface'

export interface IGetVoiceover {
  language: string
  name: string
}

export interface IVoiceoverService {
  getVoiceover(params: IGetVoiceover): AsyncResponse<string>
}
