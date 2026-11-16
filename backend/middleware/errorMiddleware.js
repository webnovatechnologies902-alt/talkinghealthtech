import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

export function notFound(req, res, next) {
  next(new ApiError(404, 'Route not found'))
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  let statusCode = error.statusCode ?? 500
  let message = error.message ?? 'Internal server error'
  let details = error.details

  if (error.code === 11000) {
    statusCode = 409
    message = 'A record with that value already exists'
    details = undefined
  } else if (error.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource identifier'
    details = undefined
  } else if (error.name === 'ValidationError') {
    statusCode = 400
    message = 'Resource validation failed'
    details = Object.values(error.errors).map(({ path, message: detail }) => ({ field: path, message: detail }))
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Invalid or expired authentication token'
    details = undefined
  } else if (error.type === 'entity.too.large') {
    statusCode = 413
    message = 'Request body is too large'
    details = undefined
  } else if (error.name === 'MulterError') {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : 'Invalid file upload'
    details = undefined
  }

  if (statusCode >= 500) {
    console.error(error)
    message = env.nodeEnv === 'production' ? 'Internal server error' : message
    details = undefined
  }

  const body = { success: false, message }
  if (details && env.nodeEnv !== 'production') body.details = details
  return res.status(statusCode).json(body)
}
