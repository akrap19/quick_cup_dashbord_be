interface ENV {
  PORT?: number
  BASE_URL?: string
  API_BASE_URL?: string
  CLIENT_BASE_URL?: string
  NODE_ENV?: string
  RATE_LIMITER_POINTS?: number
  RATE_LIMITER_DURATION_IN_SECONDS?: number
  LOGIN_LIMITER_POINTS?: number
  LOGIN_LIMITER_DURATION_IN_SECONDS?: number
  LOGIN_LIMITER_BLOCKING_DURATION_IN_SECONDS?: number
  LOG_TO_CONSOLE?: boolean
  LOG_REQUESTS?: boolean
  COMMIT_HASH?: string
  DB_HOSTNAME?: string
  DB_PORT?: number
  DB_USERNAME?: string
  DB_PASSWORD?: string
  DB_NAME?: string
  TYPEORM_SYNCHRONIZE?: boolean
  TYPEORM_RUN_MIGRATIONS?: boolean
  SALT_ROUNDS?: number
  PASSWORD_BASE64_REGEX?: string
  REFRESH_TOKEN_PUBLIC_KEY?: string
  ACCESS_TOKEN_PUBLIC_KEY?: string
  ACCESS_TOKEN_PRIVATE_KEY?: string
  REFRESH_TOKEN_PRIVATE_KEY?: string
  ACCESS_TOKEN_EXPIRES_IN?: number
  REFRESH_TOKEN_EXPIRES_IN?: number
  DOCS_USER?: string
  DOCS_PASSWORD?: string
  SUPER_ADMIN_EMAIL?: string
  SUPER_ADMIN_PASSWORD?: string
  SENDGRID_API_KEY?: string
  SENDER_EMAIL_ADDRESS?: string
  SMTP_HOST?: string
  SMTP_PORT?: number
  SMTP_USER?: string
  SMTP_PASS?: string
  SMTP_SECURE?: boolean
  SMTP_TLS_REJECT_UNAUTHORIZED?: boolean
  SFTP_HOST?: string
  SFTP_PORT?: number
  SFTP_USERNAME?: string
  SFTP_PASSWORD?: string
  SFTP_UPLOAD_BASE_PATH?: string
  SFTP_BASE_URL?: string
  GOOGLE_PLACES_API_KEY?: string
  GOOGLE_TRANSLATE_API_KEY?: string
  GOOGLE_SERVICE_ACCOUNT_KEY_LOCATION?: string
  GOOGLE_CLOUD_STORAGE_BUCKET_NAME?: string
  GOOGLE_CLOUD_PROJECT_ID?: string
  GOOGLE_CLOUD_LOCATION_ID?: string
  IMAGE_FILE_SIZE_LIMIT?: number
  VIDEO_FILE_SIZE_LIMIT?: number
  AUDIO_FILE_SIZE_LIMIT?: number
  USE_UNIX_SOCKET?: boolean
  DEFAULT_CASE_PASSWORD?: string
  DB_POOL_SIZE?: number
}

const environmentNumber = (envNum: any): number | undefined => {
  return envNum ? Number(envNum) : undefined
}

const environmentBoolean = (envBool: any): boolean | undefined => {
  return envBool === 'true' || envBool === 'false'
    ? envBool === 'true'
    : undefined
}

const getConfig = (): ENV => {
  return {
    PORT: environmentNumber(process.env.PORT) || 4000,
    BASE_URL: process.env.BASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
    CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    RATE_LIMITER_POINTS: environmentNumber(process.env.RATE_LIMITER_POINTS),
    RATE_LIMITER_DURATION_IN_SECONDS: environmentNumber(
      process.env.RATE_LIMITER_DURATION_IN_SECONDS
    ),
    LOGIN_LIMITER_POINTS: environmentNumber(process.env.LOGIN_LIMITER_POINTS),
    LOGIN_LIMITER_DURATION_IN_SECONDS: environmentNumber(
      process.env.LOGIN_LIMITER_DURATION_IN_SECONDS
    ),
    LOGIN_LIMITER_BLOCKING_DURATION_IN_SECONDS: environmentNumber(
      process.env.LOGIN_LIMITER_BLOCKING_DURATION_IN_SECONDS
    ),
    LOG_TO_CONSOLE: environmentBoolean(process.env.LOG_TO_CONSOLE),
    LOG_REQUESTS: environmentBoolean(process.env.LOG_REQUESTS),
    COMMIT_HASH: process.env.COMMIT_HASH,
    DB_HOSTNAME: process.env.DB_HOSTNAME,
    DB_PORT: environmentNumber(process.env.DB_PORT),
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    TYPEORM_SYNCHRONIZE: environmentBoolean(process.env.TYPEORM_SYNCHRONIZE),
    TYPEORM_RUN_MIGRATIONS: environmentBoolean(
      process.env.TYPEORM_RUN_MIGRATIONS
    ),
    SALT_ROUNDS: environmentNumber(process.env.SALT_ROUNDS),
    PASSWORD_BASE64_REGEX: process.env.PASSWORD_BASE64_REGEX,
    REFRESH_TOKEN_PUBLIC_KEY: process.env.REFRESH_TOKEN_PUBLIC_KEY,
    ACCESS_TOKEN_PUBLIC_KEY: process.env.ACCESS_TOKEN_PUBLIC_KEY,
    ACCESS_TOKEN_PRIVATE_KEY: process.env.ACCESS_TOKEN_PRIVATE_KEY,
    REFRESH_TOKEN_PRIVATE_KEY: process.env.REFRESH_TOKEN_PRIVATE_KEY,
    ACCESS_TOKEN_EXPIRES_IN: environmentNumber(
      process.env.ACCESS_TOKEN_EXPIRES_IN
    ),
    REFRESH_TOKEN_EXPIRES_IN: environmentNumber(
      process.env.REFRESH_TOKEN_EXPIRES_IN
    ),
    DOCS_USER: process.env.DOCS_USER,
    DOCS_PASSWORD: process.env.DOCS_PASSWORD,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: environmentNumber(process.env.SMTP_PORT),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: environmentBoolean(process.env.SMTP_SECURE),
    SMTP_TLS_REJECT_UNAUTHORIZED: environmentBoolean(
      process.env.SMTP_TLS_REJECT_UNAUTHORIZED
    ),
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
    GOOGLE_SERVICE_ACCOUNT_KEY_LOCATION:
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY_LOCATION,
    GOOGLE_CLOUD_STORAGE_BUCKET_NAME:
      process.env.GOOGLE_CLOUD_STORAGE_BUCKET_NAME,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_LOCATION_ID: process.env.GOOGLE_CLOUD_LOCATION_ID,
    IMAGE_FILE_SIZE_LIMIT: environmentNumber(process.env.IMAGE_FILE_SIZE_LIMIT),
    VIDEO_FILE_SIZE_LIMIT: environmentNumber(process.env.VIDEO_FILE_SIZE_LIMIT),
    AUDIO_FILE_SIZE_LIMIT: environmentNumber(process.env.AUDIO_FILE_SIZE_LIMIT),
    USE_UNIX_SOCKET: environmentBoolean(process.env.USE_UNIX_SOCKET),
    DEFAULT_CASE_PASSWORD: process.env.DEFAULT_CASE_PASSWORD,
    DB_POOL_SIZE: environmentNumber(process.env.DB_POOL_SIZE),
    SFTP_HOST: process.env.SFTP_HOST,
    SFTP_PORT: environmentNumber(process.env.SFTP_PORT),
    SFTP_USERNAME: process.env.SFTP_USERNAME,
    SFTP_PASSWORD: process.env.SFTP_PASSWORD,
    SFTP_UPLOAD_BASE_PATH: process.env.SFTP_UPLOAD_BASE_PATH,
    SFTP_BASE_URL: process.env.SFTP_BASE_URL
  }
}

type Config = Required<ENV>

const getSanitizedConfig = (config: ENV) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing value for ${key} in .env`)
    }
  }
  return config as Config
}

const config = getConfig()

export default getSanitizedConfig(config)
