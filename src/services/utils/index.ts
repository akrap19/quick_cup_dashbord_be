import { ResponseCode, ResponseMessage } from '../../interface'
import { ValueTransformer } from 'typeorm'

export function getResponseMessage(code: number): ResponseMessage {
  const key = ResponseCode[code] as keyof typeof ResponseMessage
  return ResponseMessage[key] || ResponseMessage.SERVER_ERROR
}

export const decimalTransformer: ValueTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value))
}
