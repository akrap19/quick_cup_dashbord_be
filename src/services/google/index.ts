import {
  Client,
  PlaceAutocompleteResult,
  PlaceAutocompleteType
} from '@googlemaps/google-maps-services-js'
import { v2 } from '@google-cloud/translate'
import { Storage } from '@google-cloud/storage'
import { axios } from '../axios'
import config from '../../config'
import { logger } from '../../logger'
import { ResponseCode, ResponseMessage } from '../../interface'
import { SearchPlacesType } from './interface'

const { Translate } = v2

const mapsClient = new Client({ axiosInstance: axios })

const translateClient = new Translate({ key: config.GOOGLE_TRANSLATE_API_KEY })

let storageClientConfig = {}
if (config.NODE_ENV == 'local') {
  storageClientConfig = {
    projectId: 'barnahus',
    keyFileName: config.GOOGLE_SERVICE_ACCOUNT_KEY_LOCATION
  }
}

const storageClient = new Storage(storageClientConfig)

// const translateParent = translateClient.locationPath(
//   config.GOOGLE_CLOUD_PROJECT_ID,
//   config.GOOGLE_CLOUD_LOCATION_ID
// )

export const searchPlaces = async (
  input: string,
  type?: SearchPlacesType
): Promise<PlaceAutocompleteResult[] | undefined> => {
  try {
    const { data } = await mapsClient.placeAutocomplete({
      params: {
        key: config.GOOGLE_PLACES_API_KEY,
        input,
        types: type as PlaceAutocompleteType | undefined
      },
      timeout: 1000
    })

    if (data && data.predictions) {
      return data.predictions
    }
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}

export const getSupportedLanguages = async (): Promise<
  v2.LanguageResult[] | undefined
> => {
  try {
    const [languages] = await translateClient.getLanguages()
    // const [{ languages }] = await translateClient.getSupportedLanguages({
    //   parent: translateParent,
    //   displayLanguageCode
    // })

    return languages
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}

export const translate = async (
  text: string,
  sourceCode: string,
  targetCode: string
): Promise<string | undefined> => {
  try {
    const [translation] = await translateClient.translate(text, {
      to: targetCode,
      from: sourceCode
    })

    return translation
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}

export const uploadFile = async (
  filePath: string,
  path: string,
  name: string
) => {
  try {
    const gcs = storageClient.bucket(config.GOOGLE_CLOUD_STORAGE_BUCKET_NAME)
    const [result] = await gcs.upload(filePath, { destination: path + name })

    return result.name
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}

export const deleteFile = async (name: string) => {
  try {
    const gcs = storageClient.bucket(config.GOOGLE_CLOUD_STORAGE_BUCKET_NAME)
    const [result] = await gcs.file(name).delete()
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}

export const getSignedURL = async (name: string | null) => {
  try {
    if(!name) return

    const gcs = storageClient.bucket(config.GOOGLE_CLOUD_STORAGE_BUCKET_NAME)
    const [url] = await gcs.file(name).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    })

    return url
  } catch (err: any) {
    logger.error({
      code: ResponseCode.FAILED_DEPENDENCY,
      message: ResponseMessage.FAILED_DEPENDENCY,
      stack: err.stack
    })
  }
}
