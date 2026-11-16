import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 6000 },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'casual', 'internship'],
    required: true,
  },
  workplaceType: { type: String, enum: ['onsite', 'hybrid', 'remote'], default: 'onsite' },
  salaryRange: { type: String, trim: true, maxlength: 120, default: '' },
  applicationUrl: { type: String, required: true, trim: true, maxlength: 2048 },
  closingDate: { type: Date, default: null },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
}, { timestamps: true })

jobSchema.index({ status: 1, publishedAt: -1, closingDate: 1 })
jobSchema.index({ company: 1, status: 1, closingDate: 1 })
jobSchema.index({ title: 'text', description: 'text', location: 'text', employmentType: 'text' })
jobSchema.pre('validate', function setJobFields() {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
})

export default mongoose.model('Job', jobSchema)
