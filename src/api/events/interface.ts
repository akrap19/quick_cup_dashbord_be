import { AsyncResponse, IServiceMethod } from '../../interface'
import { EventModel } from './eventsModel'

export interface ICreateEvent extends IServiceMethod {
  userId: string
  title: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  location?: string | null
  place?: string | null
  street?: string | null
}

export interface IUpdateEvent extends IServiceMethod {
  eventId: string
  userId?: string
  title?: string
  description?: string | null
  startDate?: Date
  endDate?: Date | null
  location?: string | null
  place?: string | null
  street?: string | null
}

export interface IDeleteEvent extends IServiceMethod {
  eventId: string
}

export interface IGetEventById extends IServiceMethod {
  eventId: string
  userId?: string | null
}

export interface IListEvents extends IServiceMethod {
  search?: string | null
  page?: number
  limit?: number
  userId?: string | null
}

export interface IEventsPagination {
  events: EventModel[]
  pagination: {
    count: number
    page: number
    limit: number
  }
}

export interface IEventService {
  listEvents(params: IListEvents): AsyncResponse<IEventsPagination>
  getEventById(params: IGetEventById): AsyncResponse<EventModel>
  createEvent(params: ICreateEvent): AsyncResponse<EventModel>
  updateEvent(params: IUpdateEvent): AsyncResponse<EventModel>
  deleteEvent(params: IDeleteEvent): AsyncResponse<null>
}
