import { ResponseCode } from '../../interface'
import {
  ICreateOnboardingSection,
  IDeleteOnboardingSection,
  IGetOnboardingSections,
  IOnboardingSectionService
} from './interface'
import { AppDataSource } from '../../services/typeorm'
import { Repository } from 'typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import { autoInjectable } from 'tsyringe'
import { OnboardingSection } from './onboardingSectionModel'

@autoInjectable()
export class OnboardingSectionService implements IOnboardingSectionService {
  private readonly onboardingSectionRepository: Repository<OnboardingSection>

  constructor() {
    this.onboardingSectionRepository =
      AppDataSource.manager.getRepository(OnboardingSection)
  }

  createOnboardingSection = async ({
    userId,
    name
  }: ICreateOnboardingSection) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const onboardingSection = new OnboardingSection(userId, name)
      await this.onboardingSectionRepository.save(onboardingSection)

      if (!onboardingSection) {
        return { code: ResponseCode.FAILED_INSERT }
      }

      return { code }
    } catch (err: any) {
      switch (err.name) {
        case 'QueryFailedError':
          code = ResponseCode.CONFLICT_DUPLICATE_ONBOARDING_SECTION
          break
        default:
          code = ResponseCode.SERVER_ERROR
          logger.error({
            code,
            message: getResponseMessage(code),
            stack: err.stack
          })
      }
    }

    return { code }
  }

  getOnboardingSections = async ({ userId }: IGetOnboardingSections) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      let onboardingSections = await this.onboardingSectionRepository.find({
        where: { userId }
      })

      return { onboardingSections, code }
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

  deleteOnboardingSection = async ({
    userId,
    name
  }: IDeleteOnboardingSection) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const onboardingSection = await this.onboardingSectionRepository.findOne({
        where: {
          userId,
          name
        }
      })

      if (!onboardingSection) {
        return { code: ResponseCode.ONBOARDING_SECTION_NOT_FOUND }
      }

      const deleteResult = await this.onboardingSectionRepository.delete({
        id: onboardingSection.id
      })

      if (deleteResult.affected !== 1) {
        return { code: ResponseCode.GONE }
      }
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
