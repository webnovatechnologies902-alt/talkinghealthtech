import ApiError from '../utils/ApiError.js'

export default function validate(schema, property = 'body') {
  return function validateRequest(req, res, next) {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    })
    if (error) {
      return next(new ApiError(400, 'Request validation failed', error.details.map(({ message, path }) => ({
        field: path.join('.'),
        message,
      }))))
    }
    if (property === 'query') req.validatedQuery = value
    else req[property] = value
    return next()
  }
}
