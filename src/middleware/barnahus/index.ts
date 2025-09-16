import { ResponseCode, ResponseError } from '../../interface'
import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import { RoleType } from '../../api/role/interface'
import { UserRoleBarnahusService } from '../../api/user_role_barnahus/userRoleBarnahusService'
import { container } from 'tsyringe'

export const requireBarnahus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let barnahusId = req.headers['x-barnahus-id']
    if (
      !barnahusId ||
      typeof barnahusId != 'string' ||
      !barnahusId.match(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      )
    ) {
      throw new ResponseError(ResponseCode.BARNAHUS_REQUIRED)
    }

    const { authenticatedRoles } = req.user

    if (!authenticatedRoles) {
      throw new ResponseError(ResponseCode.FORBIDDEN)
    }

    const barnahusRoles = authenticatedRoles.flatMap((authRole) =>
      authRole.userRoleBarnahuses.filter(
        (userRoleBarnahus) => userRoleBarnahus.barnahusId === barnahusId
      )
    )

    if (barnahusRoles.length === 0) {
      throw new ResponseError(ResponseCode.FORBIDDEN)
    }

    req.user = { ...req.user, barnahusId }

    return next()
  } catch (e: any) {
    next(e)
  }
}
