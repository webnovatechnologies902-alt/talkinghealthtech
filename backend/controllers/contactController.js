import ContactMessage from '../models/ContactMessage.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import { isEmailConfigured, sendContactNotification } from '../services/emailService.js'

export const submitContactMessage = asyncHandler(async (req, res) => {
  const savedMessage = await ContactMessage.create(req.body)
  let message = 'Your message has been received and saved for the team.'
  let status = 201
  if (isEmailConfigured()) {
    try {
      const notified = await sendContactNotification(req.body)
      if (notified) message = 'Your message has been received. The team has been notified.'
      else message = 'Your message has been received and saved; email notification is not configured.'
    } catch (error) {
      console.error('Contact notification email could not be sent', error.code ?? 'unknown error')
      message = 'Your message has been saved, but the team email notification could not be sent.'
      status = 202
    }
  }
  return res.status(status).json(new ApiResponse(status, message, { id: savedMessage._id }))
})
