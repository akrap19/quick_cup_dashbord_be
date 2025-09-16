import { app } from './app'
import config from './config'
import { logger } from './logger'

const port = config.PORT
const commitHash = config.COMMIT_HASH

const server = app.listen(port, () => {
  logger.info(
    `Journeys listening at http://localhost:${port} with commit hash ${commitHash}`
  )
})

export const closeServer = () => {
  server.close()
}