import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
  logo: { type: String, trim: true, maxlength: 2048, default: '' },
  website: { type: String, trim: true, maxlength: 2048, default: '' },
  sector: { type: String, trim: true, maxlength: 120, default: '' },
  location: { type: String, trim: true, maxlength: 200, default: '' },
  tags: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
}, { timestamps: true })

companySchema.index({ status: 1, publishedAt: -1 })
companySchema.index({ name: 'text', description: 'text', sector: 'text', location: 'text', tags: 'text' })
companySchema.pre('validate', function setCompanyFields() {
  if (!this.slug && this.name) this.slug = slugify(this.name)
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
})

export default mongoose.model('Company', companySchema)
