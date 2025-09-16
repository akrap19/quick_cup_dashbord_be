import { AsyncResponse } from '../../interface'
import { OnboardingSection } from './onboardingSectionModel'

export interface ICreateOnboardingSection {
  userId: string
  name: string
}

export interface IGetOnboardingSections {
  userId: string
}

export interface IDeleteOnboardingSection {
  userId: string
  name: string
}

export interface IOnboardingSectionService {
  createOnboardingSection(params: ICreateOnboardingSection): AsyncResponse<null>
  getOnboardingSections(
    params: IGetOnboardingSections
  ): AsyncResponse<OnboardingSection[]>
  deleteOnboardingSection(params: IDeleteOnboardingSection): AsyncResponse<null>
}
