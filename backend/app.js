
import cors from 'cors'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env } from './config/env.js'
import {
  connectDatabase,
  databaseStatus,
} from './config/db.js'

import {
  errorHandler,
  notFound,
} from './middleware/errorMiddleware.js'

import verifyCookieRequestOrigin from './middleware/csrfMiddleware.js'
import ApiResponse from './utils/ApiResponse.js'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import articleRoutes from './routes/articleRoutes.js'
import podcastRoutes from './routes/podcastRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import glossaryRoutes from './routes/glossaryRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import contactRoutes from './routes/contactRoutes.js'

const app = express()

// --------------------------------------------------
// Application configuration
// --------------------------------------------------

app.disable('x-powered-by')
app.set('trust proxy', env.trustProxy)

// --------------------------------------------------
// Security middleware
// --------------------------------------------------

app.use(helmet())

// --------------------------------------------------
// CORS configuration
// --------------------------------------------------

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === env.frontendUrl) {
      return callback(null, true)
    }

    const error = new Error('Origin is not allowed by CORS')
    error.statusCode = 403

    return callback(error)
  },

  credentials: true,

  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}))

// --------------------------------------------------
// Request parsing
// --------------------------------------------------

app.use(express.json({ limit: '1mb' }))

app.use(express.urlencoded({
  extended: false,
  limit: '1mb',
}))

app.use(cookieParser())
app.use(mongoSanitize())

app.use(morgan(
  env.nodeEnv === 'production' ? 'combined' : 'dev'
))

// --------------------------------------------------
// CSRF protection
// --------------------------------------------------

app.use(verifyCookieRequestOrigin)

// --------------------------------------------------
// MongoDB connection management
// --------------------------------------------------

// Reuse the connection promise across requests
// handled by the same Vercel function instance.


let databaseConnectionPromise

async function ensureDatabaseConnection() {
  const status = databaseStatus()

  if (status === 'connected') {
    return
  }

  // Reset promise if MongoDB disconnected
  if (status === 'disconnected') {
    databaseConnectionPromise = undefined
  }

  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase().catch((error) => {
      databaseConnectionPromise = undefined
      throw error
    })
  }

  await databaseConnectionPromise
}


// --------------------------------------------------
// Root endpoint
// --------------------------------------------------

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Talking HealthTech API is running',
    healthEndpoint: '/api/v1/health',
  })
})

// --------------------------------------------------
// Database middleware
// --------------------------------------------------

app.use(async (req, res, next) => {
  try {
    await ensureDatabaseConnection()
    next()
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error
    )

    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
    })
  }
})

// --------------------------------------------------
// API routes
// --------------------------------------------------

const api = express.Router()

// Health check
api.get('/health', (req, res) => {
  const database = databaseStatus()

  const statusCode =
    database === 'connected' ? 200 : 503

  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      'Service health',
      {
        server: 'ok',
        database,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      }
    )
  )
})

// Authentication
api.use('/auth', authRoutes)

// Users
api.use('/users', userRoutes)

// Articles
api.use('/articles', articleRoutes)

// Podcasts
api.use('/podcasts', podcastRoutes)

// Categories
api.use('/categories', categoryRoutes)

// Glossary
api.use('/glossary', glossaryRoutes)

// Events
api.use('/events', eventRoutes)

// Newsletter
api.use('/newsletter', newsletterRoutes)

// Admin
api.use('/admin', adminRoutes)

// Companies
api.use('/companies', companyRoutes)

// Jobs
api.use('/jobs', jobRoutes)

// Contact
api.use('/contact', contactRoutes)

// Mount API router
app.use('/api/v1', api)

// --------------------------------------------------
// Error handling
// --------------------------------------------------

app.use(notFound)
app.use(errorHandler)

// --------------------------------------------------
// Export Express application for Vercel
// --------------------------------------------------

export default app
