export enum EmailTemplates {
  INVITATION = 'INVITATION',
  EMAIL_CONFIRMATION = 'EMAIL_CONFIRMATION',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD'
}

export type EmailTemplateData = {
  URL: string
  ROLE: string
}
