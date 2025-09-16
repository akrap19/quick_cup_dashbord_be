import { NextFunction, Request, Response } from 'express'
import { BarnahusService } from './barnahusService'
import { IBarnahusLimited, IBarnahusesPaginationLimited } from './interface'
import { ResponseCode } from '../../interface'
import { autoInjectable } from 'tsyringe'
import { RoleType } from '../role/interface'
import { RoomService } from '../room/roomService'
import { StaffService } from '../staff/staffService'
import { AboutService } from '../about/aboutService'

@autoInjectable()
export class BarnahusController {
  private readonly barnahusService: BarnahusService
  private readonly roomService: RoomService
  private readonly staffService: StaffService
  private readonly aboutService: AboutService

  constructor(
    barnahusService: BarnahusService,
    roomService: RoomService,
    staffService: StaffService,
    aboutService: AboutService
  ) {
    this.barnahusService = barnahusService
    this.roomService = roomService
    this.staffService = staffService
    this.aboutService = aboutService
  }

  createBarnahus = async (req: Request, res: Response, next: NextFunction) => {
    const { name, location, userId } = res.locals.input
    const { id } = req.user

    const { code } = await this.barnahusService.createBarnahus({
      name,
      location,
      userId,
      assignedById: id
    })

    return next({ code })
  }

  getBarnahuses = async (req: Request, res: Response, next: NextFunction) => {
    const { search, page, limit } = res.locals.input

    const { barnahusData, code } = await this.barnahusService.getBarnahuses({
      search,
      page,
      limit
    })

    if (barnahusData) {
      const barnahusesLimited: IBarnahusLimited[] = barnahusData.barnahuses.map(
        (x) => {
          const admin = x.userRoleBarnahuses.find(
            (userRoleBarnahus) =>
              userRoleBarnahus.userRole.role.name == RoleType.MASTER_ADMIN
          )?.userRole.user

          return {
            barnahusId: x.id,
            name: x.name,
            location: x.location,
            locationCode: x.locationCode,
            admin: admin ? `${admin.firstName} ${admin.lastName}` : null
          }
        }
      )

      let barnahusesLimitedData: IBarnahusesPaginationLimited = {
        pagination: barnahusData.pagination,
        barnahuses: barnahusesLimited
      }

      return next({ data: barnahusesLimitedData, code })
    }

    return next({ code })
  }

  getBarnahus = async (req: Request, res: Response, next: NextFunction) => {
    const { barnahusId } = res.locals.input

    const { barnahus, code } = await this.barnahusService.getBarnahusById({
      barnahusId
    })
    if (!barnahus) {
      return next({ code })
    }

    const admin = barnahus.userRoleBarnahuses.find(
      (userRoleBarnahus) =>
        userRoleBarnahus.userRole.role.name == RoleType.MASTER_ADMIN
    )?.userRole.user
    let barnahusLimited = {
      barnahusId: barnahus.id,
      name: barnahus.name,
      location: barnahus.location,
      locationCode: barnahus.locationCode,
      admin: admin ? `${admin.firstName} ${admin.lastName}` : null,
      adminId: admin ? admin.id : null
    }

    return next({ data: { barnahus: barnahusLimited }, code })
  }

  editBarnahus = async (req: Request, res: Response, next: NextFunction) => {
    const { barnahusId, name, location, adminId } = res.locals.input
    const { id } = req.user

    const { code } = await this.barnahusService.editBarnahus({
      barnahusId,
      name,
      location,
      adminId,
      assignedById: id
    })
    return next({ code })
  }

  getAssignableBarnahuses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { search } = res.locals.input

    let { barnahuses, code } =
      await this.barnahusService.getAssignableBarnahuses({
        search
      })

    let barnahusesLimited: IBarnahusLimited[]
    if (barnahuses) {
      barnahusesLimited = barnahuses.map((x) => {
        const masterAdmin = x.userRoleBarnahuses.find(
          (userRoleBarnahus) =>
            userRoleBarnahus.userRole.role.name == RoleType.MASTER_ADMIN
        )?.userRole.user

        return {
          barnahusId: x.id,
          name: x.name,
          location: x.location,
          locationCode: x.locationCode,
          admin: masterAdmin
            ? `${masterAdmin.firstName} ${masterAdmin.lastName}`
            : null
        }
      })

      return next({ data: { barnahuses: barnahusesLimited }, code })
    }
  }

  deleteBarnahus = async (req: Request, res: Response, next: NextFunction) => {
    const { barnahusId } = res.locals.input

    const { code } = await this.barnahusService.deleteBarnahus({
      barnahusId
    })

    return next({ code })
  }

  bulkDeleteBarnahuses = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { barnahusIds } = res.locals.input

    const { code } = await this.barnahusService.bulkDeleteBarnahuses({
      barnahusIds
    })

    return next({ code })
  }

  searchBarnahusLocations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { search } = res.locals.input

    if (!search || search.length < 3) {
      return next({ data: { locations: [] }, code: ResponseCode.OK })
    }

    const { locations, code } =
      await this.barnahusService.searchBarnahusLocations({
        search
      })

    return next({ data: { locations }, code })
  }

  getBarnahusLocations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { locations, code } =
      await this.barnahusService.getBarnahusLocations()

    return next({ data: { locations }, code })
  }

  getBarnahusTranslations = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { barnahusId } = res.locals.input

    const { roomData, code: roomCode } = await this.roomService.getRooms({
      barnahusId,
      page: 1,
      limit: 1000
    })

    if (!roomData) {
      return next({ code: roomCode })
    }

    const { staffData, code: staffCode } = await this.staffService.getStaff({
      barnahusId,
      page: 1,
      limit: 1000
    })

    if (!staffData) {
      return next({ code: staffCode })
    }

    const { aboutData, code: aboutCode } = await this.aboutService.getAbouts({
      barnahusId,
      page: 1,
      limit: 1000
    })

    if (!aboutData) {
      return next({ code: aboutCode })
    }

    const translations = {
      roomData,
      staffData,
      aboutData
    }

    return next({ data: translations, code: aboutCode })
  }
}
