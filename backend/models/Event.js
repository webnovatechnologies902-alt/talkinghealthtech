import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  image: { type: String, trim: true, maxlength: 2048, default: '' },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  eventDate: { type: Date, required: true },
  registrationUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
}, { timestamps: true })

eventSchema.index({ status: 1, eventDate: 1 })
eventSchema.index({ title: 'text', description: 'text', location: 'text' })
eventSchema.pre('validate', function setSlug() {
  if (!this.slug && this.title) this.slug = slugify(this.title)
})

export default mongoose.model('Event', eventSchema)
