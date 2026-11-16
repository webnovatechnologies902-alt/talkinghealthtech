export default class ApiResponse {
  constructor(statusCode, message, data = null, pagination) {
    Object.defineProperty(this, 'statusCode', { value: statusCode, enumerable: false })
    this.success = true
    this.message = message
    this.data = data
    if (pagination) this.pagination = pagination
  }
}
