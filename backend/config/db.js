import mongoose from 'mongoose'
import { env } from './env.js'
import User from '../models/User.js'
import Article from '../models/Article.js'
import Podcast from '../models/Podcast.js'
import Category from '../models/Category.js'
import Glossary from '../models/Glossary.js'
import Event from '../models/Event.js'
import Newsletter from '../models/Newsletter.js'
import Company from '../models/Company.js'
import Job from '../models/Job.js'
import ContactMessage from '../models/ContactMessage.js'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
 const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: false,
  })
console.log(`MongoDB connected: ${connection.connection.host}`)

  await Promise.all([User, Article, Podcast, Category, Glossary, Event, Newsletter, Company, Job, ContactMessage]
    .map((model) => model.createIndexes()))
  return mongoose.connection
}

export function databaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  return states[mongoose.connection.readyState] ?? 'unknown'
}
