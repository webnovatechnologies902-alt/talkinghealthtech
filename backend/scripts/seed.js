import mongoose from 'mongoose'
import { connectDatabase } from '../config/db.js'
import { env } from '../config/env.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import Article from '../models/Article.js'
import Podcast from '../models/Podcast.js'
import Glossary from '../models/Glossary.js'
import Event from '../models/Event.js'
import slugify from '../utils/slugify.js'

async function seed() {
  if (!env.adminName || !env.adminEmail || !env.adminPassword) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed the initial admin')
  }

  await connectDatabase()
  let admin = await User.findOne({ email: env.adminEmail })
  if (admin) {
    console.info('Seed admin already exists; leaving it unchanged')
  } else {
    admin = await User.create({
      name: env.adminName,
      email: env.adminEmail,
      password: env.adminPassword,
      role: 'admin',
    })
    console.info('Initial admin account created')
  }

  const categorySeeds = [
    { name: 'Digital Health', type: 'article', description: 'Digital services and connected care.' },
    { name: 'Artificial Intelligence', type: 'article', description: 'Responsible AI in health and care.' },
    { name: 'HealthTech Startups', type: 'article', description: 'New ideas and ventures in health technology.' },
    { name: 'Healthcare Innovation', type: 'article', description: 'People and ideas improving healthcare.' },
    { name: 'Medical Technology', type: 'article', description: 'Tools and technologies supporting care.' },
    { name: 'HealthTech Conversations', type: 'podcast', description: 'Health technology podcast episodes.' },
    { name: 'Community Events', type: 'event', description: 'Health technology community gatherings.' },
    { name: 'HealthTech Concepts', type: 'glossary', description: 'Definitions of health technology terms.' },
  ]
  const categories = new Map()
  for (const item of categorySeeds) {
    const slug = slugify(item.name)
    const category = await Category.findOneAndUpdate(
      { slug },
      { $setOnInsert: { ...item, slug, isActive: true } },
      { upsert: true, new: true, runValidators: true, timestamps: false },
    )
    categories.set(`${item.type}:${slug}`, category._id)
  }

  const articleSeeds = [
    {
      title: 'Building a more connected front door to care',
      excerpt: 'Digital-first services can help people find the right care with less friction.',
      content: 'A thoughtful digital front door can make it easier for people to find the support they need. The most useful services are designed around real care pathways, accessible information and clear next steps. Collaboration between care teams and technology partners helps make those experiences practical and trustworthy.',
      category: categories.get('article:digital-health'),
      tags: ['digital health', 'connected care'],
      status: 'published',
      seoDescription: 'Explore how digital-first health services can make care easier to navigate.',
    },
    {
      title: 'Making room for responsible AI in clinical work',
      excerpt: 'Useful AI tools start with the needs and workflows of care teams.',
      content: 'Artificial intelligence can support healthcare teams when it is developed with clear goals, appropriate oversight and meaningful human involvement. Pilots should be measured against real workflows, and teams should understand how a system reaches its recommendations before relying on it in care settings.',
      category: categories.get('article:artificial-intelligence'),
      tags: ['AI', 'clinical workflows'],
      status: 'published',
      seoDescription: 'A practical look at responsible AI design in clinical settings.',
    },
  ]
  for (const item of articleSeeds) {
    const slug = slugify(item.title)
    await Article.updateOne(
      { slug },
      { $setOnInsert: { ...item, slug, author: admin._id, publishedAt: new Date() } },
      { upsert: true, runValidators: true, timestamps: false },
    )
  }

  const podcastSeeds = [
    {
      title: 'From digital ambition to better everyday care',
      description: 'A conversation about designing digital services that help people and care teams.',
      host: env.adminName,
      guests: ['Digital health leaders'],
      category: categories.get('podcast:healthtech-conversations'),
      status: 'published',
      duration: 32,
    },
  ]
  for (const item of podcastSeeds) {
    const slug = slugify(item.title)
    await Podcast.updateOne(
      { slug },
      { $setOnInsert: { ...item, slug, publishedAt: new Date() } },
      { upsert: true, runValidators: true, timestamps: false },
    )
  }

  const glossarySeeds = [
    {
      term: 'Digital health',
      definition: 'The use of digital technologies, data and connected tools to support health and healthcare delivery.',
      category: categories.get('glossary:healthtech-concepts'),
    },
    {
      term: 'Interoperability',
      definition: 'The ability of different information systems and devices to exchange, interpret and use health data.',
      category: categories.get('glossary:healthtech-concepts'),
    },
  ]
  for (const item of glossarySeeds) {
    const slug = slugify(item.term)
    await Glossary.updateOne(
      { slug },
      { $setOnInsert: { ...item, slug } },
      { upsert: true, runValidators: true, timestamps: false },
    )
  }

  const event = {
    title: 'HealthTech in the real world',
    description: 'A community gathering to share practical lessons from digital health delivery.',
    location: 'Online',
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: categories.get('event:community-events'),
    status: 'published',
  }
  const eventSlug = slugify(event.title)
  await Event.updateOne(
    { slug: eventSlug },
    { $setOnInsert: { ...event, slug: eventSlug } },
    { upsert: true, runValidators: true, timestamps: false },
  )

  console.info('Seed completed. Existing content was left unchanged.')
}

try {
  await seed()
} catch (error) {
  console.error('Seed failed', error)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
