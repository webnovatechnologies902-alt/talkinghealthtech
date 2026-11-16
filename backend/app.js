import cors from 'cors'
import express from 'express'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { env } from './config/env.js'
import { databaseStatus } from './config/db.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
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
app.disable('x-powered-by')
app.set('trust proxy', env.trustProxy)
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === env.frontendUrl) return callback(null, true)
    const error = new Error('Origin is not allowed by CORS')
    error.statusCode = 403
    return callback(error)
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())
app.use(mongoSanitize())
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'))
app.use(verifyCookieRequestOrigin)

const api = express.Router()
api.get('/health', (req, res) => {
  const database = databaseStatus()
  const statusCode = database === 'connected' ? 200 : 503
  return res.status(statusCode).json(new ApiResponse(statusCode, 'Service health', {
    server: 'ok',
    database,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }))
})
api.use('/auth', authRoutes)
api.use('/users', userRoutes)
api.use('/articles', articleRoutes)
api.use('/podcasts', podcastRoutes)
api.use('/categories', categoryRoutes)
api.use('/glossary', glossaryRoutes)
api.use('/events', eventRoutes)
api.use('/newsletter', newsletterRoutes)
api.use('/admin', adminRoutes)
api.use('/companies', companyRoutes)
api.use('/jobs', jobRoutes)
api.use('/contact', contactRoutes)

app.use('/api/v1', api)
app.use(notFound)
app.use(errorHandler)

export default app
