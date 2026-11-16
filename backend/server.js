import http from 'node:http'
import mongoose from 'mongoose'
import app from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'

const server = http.createServer(app)
let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.info(`${signal} received; shutting down`)

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  if (server.listening) {
    await new Promise((resolve) => server.close(resolve))
  }
  await mongoose.disconnect()
  clearTimeout(forceExit)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shutdown(signal).then(() => process.exit(0)).catch((error) => {
      console.error('Shutdown failed', error)
      process.exit(1)
    })
  })
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection', error)
  shutdown('unhandledRejection').then(() => process.exit(1))
})

try {
  await connectDatabase()
  server.listen(env.port, () => {
    console.info(`Talking HealthTech API listening on port ${env.port}`)
  })
} catch (error) {
  console.error('Unable to start API server', error)
  await mongoose.disconnect().catch((disconnectError) => console.error('Database disconnect failed', disconnectError))
  process.exitCode = 1
}
