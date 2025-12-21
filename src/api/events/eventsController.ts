import { NextFunction, Request, Response } from 'express'
import { autoInjectable } from 'tsyringe'

import { ResponseCode } from '../../interface'
import { EventsService } from './eventsService'
import { RoleType } from '../role/interface'

@autoInjectable()
export class EventsController {
  private readonly eventsService: EventsService

  constructor(eventsService: EventsService) {
    this.eventsService = eventsService
  }

  listEvents = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { page, limit, search } = input

    const pageNumber = typeof page === 'number' ? page : undefined
    const limitNumber = typeof limit === 'number' ? limit : undefined
    const searchTerm = typeof search === 'string' ? search : null

    // If user is a CLIENT, filter events by their userId
    const isClient = req.user?.roles?.some(
      (userRole) => userRole.role.name === RoleType.CLIENT
    )
    const userId = isClient ? req.user?.id : null

    const { events, pagination, code } = await this.eventsService.listEvents({
      page: pageNumber,
      limit: limitNumber,
      search: searchTerm,
      userId
    })

    if (!events || !pagination) {
      return next({ code })
    }

    return next({
      data: {
        events,
        pagination
      },
      code
    })
  }

  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { eventId } = input

    // If user is a CLIENT, filter events by their userId
    const isClient = req.user?.roles?.some(
      (userRole) => userRole.role.name === RoleType.CLIENT
    )
    const userId = isClient ? req.user?.id : null

    const { event, code } = await this.eventsService.getEventById({
      eventId,
      userId
    })

    if (!event) {
      return next({ code })
    }

    return next({ data: event, code })
  }

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { userId, title, description, startDate, endDate, location, place, street } = input

    if (typeof userId !== 'string' || !title || !(startDate instanceof Date)) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { event, code } = await this.eventsService.createEvent({
      userId,
      title,
      description,
      startDate,
      endDate,
      location,
      place,
      street
    })

    if (!event) {
      return next({ code })
    }

    return next({ data: event, code })
  }

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const {
      eventId,
      userId,
      title,
      description,
      startDate,
      endDate,
      location,
      place,
      street
    } = input

    if (
      typeof eventId !== 'string' ||
      (typeof title === 'undefined' &&
        typeof description === 'undefined' &&
        typeof startDate === 'undefined' &&
        typeof endDate === 'undefined' &&
        typeof location === 'undefined' &&
        typeof place === 'undefined' &&
        typeof street === 'undefined' &&
        typeof userId === 'undefined')
    ) {
      return next({ code: ResponseCode.INVALID_INPUT })
    }

    const { event, code } = await this.eventsService.updateEvent({
      eventId,
      userId,
      title,
      description,
      startDate,
      endDate,
      location,
      place,
      street
    })

    if (!event) {
      return next({ code })
    }

    return next({ data: event, code })
  }

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    const input = res.locals.input ?? {}
    const { eventId } = input

    const { code } = await this.eventsService.deleteEvent({
      eventId
    })

    return next({ code })
  }
}
