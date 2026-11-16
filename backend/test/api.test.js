import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'

process.env.NODE_ENV = 'test'
process.env.PORT = '5000'
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/talking-healthtech-test'
process.env.JWT_SECRET = 'test-only-secret-that-is-at-least-thirty-two-characters'
process.env.FRONTEND_URL = 'http://localhost:5173'

const [{ default: app }, { default: slugify }, { registerSchema }] = await Promise.all([
  import('../app.js'),
  import('../utils/slugify.js'),
  import('../validations/authValidation.js'),
])

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health endpoint reports server and database availability without leaking configuration', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`)
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.equal(body.success, true)
  assert.equal(body.data.server, 'ok')
  assert.equal(body.data.database, 'disconnected')
  assert.equal(JSON.stringify(body).includes('mongodb://'), false)
})

test('authentication validation rejects malformed requests before database access', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }),
  })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).success, false)
})

test('resource pagination rejects unbounded page offsets', async () => {
  const response = await fetch(`${baseUrl}/api/v1/articles?page=10001`)
  assert.equal(response.status, 400)
})

test('company and job listings use validated list query parameters', async () => {
  const [companies, jobs] = await Promise.all([
    fetch(`${baseUrl}/api/v1/companies?page=10001`),
    fetch(`${baseUrl}/api/v1/jobs?limit=101`),
  ])
  assert.equal(companies.status, 400)
  assert.equal(jobs.status, 400)
})

test('contact requests are validated before attempting database writes', async () => {
  const response = await fetch(`${baseUrl}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Sender', email: 'not-an-email', message: 'short' }),
  })
  assert.equal(response.status, 400)
  assert.equal((await response.json()).success, false)
})

test('registration schema strips client-supplied roles', () => {
  const { value, error } = registerSchema.validate({
    name: 'Sample User',
    email: 'sample@example.com',
    password: 'a-long-enough-password',
    role: 'admin',
  }, { stripUnknown: true })

  assert.equal(error, undefined)
  assert.equal(value.role, undefined)
})

test('slug generation is URL-friendly and deterministic', () => {
  assert.equal(slugify('AI & Digital Health: A Guide'), 'ai-digital-health-a-guide')
})

test('unknown routes use the standard safe error shape', async () => {
  const response = await fetch(`${baseUrl}/api/v1/unknown`)
  const body = await response.json()

  assert.equal(response.status, 404)
  assert.deepEqual(body, { success: false, message: 'Route not found' })
})

test('CORS allows the configured frontend and rejects other origins', async () => {
  const accepted = await fetch(`${baseUrl}/api/v1/health`, {
    headers: { Origin: 'http://localhost:5173' },
  })
  assert.equal(accepted.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.equal(accepted.headers.get('access-control-allow-credentials'), 'true')

  const rejected = await fetch(`${baseUrl}/api/v1/health`, {
    headers: { Origin: 'https://untrusted.example' },
  })
  assert.equal(rejected.status, 403)
  assert.equal((await rejected.json()).success, false)
})
