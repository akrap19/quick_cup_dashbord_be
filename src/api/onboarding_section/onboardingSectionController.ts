import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'
import { OnboardingSectionService } from './onboardingSectionService'

@autoInjectable()
export class OnboardingSectionController {
  private readonly onboardingSectionService: OnboardingSectionService

  constructor(onboardingSectionService: OnboardingSectionService) {
    this.onboardingSectionService = onboardingSectionService
  }

  createOnboardingSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { onboardingSection } = res.locals.input
    const { id } = req.user

    const { code } =
      await this.onboardingSectionService.createOnboardingSection({
        userId: id,
        name: onboardingSection
      })

    return next({ code })
  }

  getOnboardingSections = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.user

    const { onboardingSections: onboardingSectionList, code } =
      await this.onboardingSectionService.getOnboardingSections({
        userId: id
      })
    if (!onboardingSectionList) {
      return next({ code })
    }

    const onboardingSections: string[] = onboardingSectionList.map(
      (onboardingSection) => {
        return onboardingSection.name
      }
    )

    return next({
      data: { onboardingSections },
      code
    })
  }

  deleteOnboardingSection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { onboardingSection } = res.locals.input
    const { id } = req.user

    const { code } =
      await this.onboardingSectionService.deleteOnboardingSection({
        userId: id,
        name: onboardingSection
      })

    return next({ code })
  }
}
