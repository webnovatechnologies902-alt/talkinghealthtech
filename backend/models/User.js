import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false, minlength: 12, maxlength: 128 },
  role: { type: String, enum: ['user', 'admin'], default: 'user', immutable: true },
  profileImage: { type: String, trim: true, maxlength: 2048, default: '' },
  isActive: { type: Boolean, default: true, select: false },
  authVersion: { type: Number, min: 0, default: 0 },
}, { timestamps: true })

userSchema.index({ createdAt: -1 })
userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12)
})
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
