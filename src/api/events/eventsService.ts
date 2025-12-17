import { Repository } from 'typeorm'
import { autoInjectable } from 'tsyringe'

import { AsyncResponse, ResponseCode } from '../../interface'
import { AppDataSource } from '../../services/typeorm'
import { logger } from '../../logger'
import { getResponseMessage } from '../../services/utils'
import {
  ICreateEvent,
  IDeleteEvent,
  IEventService,
  IEventsPagination,
  IGetEventById,
  IListEvents,
  IUpdateEvent
} from './interface'
import { EventModel } from './eventsModel'

type ListEventsResponse = Awaited<AsyncResponse<IEventsPagination>>

@autoInjectable()
export class EventsService implements IEventService {
  private readonly eventRepository: Repository<EventModel>

  constructor() {
    this.eventRepository = AppDataSource.manager.getRepository(EventModel)
  }

  listEvents = async ({
    search,
    page = 1,
    limit = 25,
    queryRunner
  }: IListEvents): AsyncResponse<IEventsPagination> => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const currentPage = page && page > 0 ? page : 1
      const currentLimit = limit && limit > 0 ? limit : 25

      const repository = queryRunner
        ? queryRunner.manager.getRepository(EventModel)
        : this.eventRepository

      const query = repository.createQueryBuilder('event')

      if (search) {
        const searchLike = `%${search.toLowerCase()}%`
        query.andWhere(
          'LOWER(event.title) LIKE :searchLike OR LOWER(event.location) LIKE :searchLike',
          { searchLike }
        )
      }

      const offset = (currentPage - 1) * currentLimit

      const [events, count] = await query
        .orderBy('event.startDate', 'DESC')
        .skip(offset)
        .take(currentLimit)
        .getManyAndCount()

      const response = {
        events,
        pagination: {
          count,
          page: currentPage,
          limit: currentLimit
        },
        code
      }

      return response as unknown as ListEventsResponse
    } catch (err: any) {
      code = ResponseCode.SERVER_ERROR
      logger.error({
        code,
        message: getResponseMessage(code),
        stack: err.stack
      })
    }

    return { code } as unknown as ListEventsResponse
  }

  getEventById = async ({ eventId, queryRunner }: IGetEventById) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(EventModel)
        : this.eventRepository

      const event = await repository.findOne({ where: { id: eventId } })

      if (!event) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { event, code }
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

  createEvent = async ({
    userId,
    title,
    description,
    startDate,
    endDate,
    location,
    place,
    street,
    queryRunner
  }: ICreateEvent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(EventModel)
        : this.eventRepository

      const event = repository.create({
        userId,
        title,
        description: description ?? null,
        startDate,
        endDate: endDate ?? null,
        location: location ?? null,
        place: place ?? null,
        street: street ?? null
      })

      const savedEvent = await repository.save(event)

      return { event: savedEvent, code }
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

  updateEvent = async ({
    eventId,
    userId,
    title,
    description,
    startDate,
    endDate,
    location,
    place,
    street,
    queryRunner
  }: IUpdateEvent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(EventModel)
        : this.eventRepository

      const updateData: Partial<EventModel> = {}

      if (typeof userId !== 'undefined') {
        updateData.userId = userId
      }

      if (typeof title !== 'undefined') {
        updateData.title = title
      }
      if (typeof description !== 'undefined') {
        updateData.description = description ?? null
      }
      if (typeof startDate !== 'undefined') {
        updateData.startDate = startDate
      }
      if (typeof endDate !== 'undefined') {
        updateData.endDate = endDate ?? null
      }
      if (typeof location !== 'undefined') {
        updateData.location = location ?? null
      }
      if (typeof place !== 'undefined') {
        updateData.place = place ?? null
      }
      if (typeof street !== 'undefined') {
        updateData.street = street ?? null
      }

      const result = await repository
        .createQueryBuilder()
        .update(EventModel)
        .set(updateData)
        .where('id = :eventId', { eventId })
        .execute()

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      const { event, code: getCode } = await this.getEventById({
        eventId,
        queryRunner
      })

      if (!event) {
        return { code: getCode }
      }

      return { event, code }
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

  deleteEvent = async ({ eventId, queryRunner }: IDeleteEvent) => {
    let code: ResponseCode = ResponseCode.OK

    try {
      const repository = queryRunner
        ? queryRunner.manager.getRepository(EventModel)
        : this.eventRepository

      const result = await repository.delete({ id: eventId })

      if (!result.affected) {
        return { code: ResponseCode.NOT_FOUND }
      }

      return { code }
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
