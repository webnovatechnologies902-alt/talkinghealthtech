import test from 'node:test'
import assert from 'node:assert/strict'

const enabled = process.env.RUN_DB_INTEGRATION === 'true'

test('MongoDB-backed auth and resource APIs', { skip: !enabled, timeout: 60000 }, async () => {
  const databaseName = `talking_healthtech_test_${process.pid}_${Date.now()}`
  process.env.NODE_ENV = 'test'
  process.env.PORT = '5000'
  process.env.MONGO_URI = `mongodb://127.0.0.1:27017/${databaseName}`
  process.env.JWT_SECRET = 'integration-test-secret-with-at-least-thirty-two-characters'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  process.env.SMTP_HOST = ''
  process.env.SMTP_FROM_EMAIL = ''
  process.env.SMTP_USER = ''
  process.env.SMTP_PASSWORD = ''
  process.env.CONTACT_EMAIL = ''

  const [{ default: app }, { connectDatabase }, { default: mongoose }, { default: User }, { default: Newsletter }, { generateToken }] = await Promise.all([
    import('../app.js'),
    import('../config/db.js'),
    import('mongoose'),
    import('../models/User.js'),
    import('../models/Newsletter.js'),
    import('../utils/generateToken.js'),
  ])
  let server
  let databaseConnected = false

  try {
    await connectDatabase()
    databaseConnected = true
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`
    const request = async (path, { method = 'GET', body, token, origin } = {}) => {
      const headers = {}
      if (body !== undefined) headers['Content-Type'] = 'application/json'
      if (token) headers.Authorization = `Bearer ${token}`
      if (origin) headers.Origin = origin
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      return { status: response.status, body: await response.json() }
    }

    const admin = await User.create({
      name: 'Integration Admin',
      email: `admin-${databaseName}@example.com`,
      password: 'integration-admin-password-123',
      role: 'admin',
    })
    const adminToken = generateToken(admin._id.toString())

    const company = await request('/companies', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Integration HealthTech Company',
        description: 'A health technology company profile for integration testing.',
        sector: 'Digital health',
        status: 'published',
      },
    })
    assert.equal(company.status, 201)
    const companyId = company.body.data._id
    assert.equal((await request('/companies')).body.pagination.total, 1)

    const job = await request('/jobs', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'Digital Health Product Manager',
        company: companyId,
        description: 'Help care teams adopt useful and safe health technology products.',
        location: 'Sydney, Australia',
        employmentType: 'full-time',
        workplaceType: 'hybrid',
        applicationUrl: 'https://example.com/careers/product-manager',
        closingDate: new Date(Date.now() + 86400000 * 10).toISOString(),
        status: 'published',
      },
    })
    assert.equal(job.status, 201)
    assert.equal((await request('/jobs')).body.pagination.total, 1)
    assert.equal((await request(`/jobs?company=${companyId}`)).body.pagination.total, 1)
    assert.equal((await request(`/jobs/${job.body.data.slug}`)).body.data.company.name, company.body.data.name)
    assert.equal((await request(`/companies/${companyId}`, { method: 'DELETE', token: adminToken })).status, 409)

    const registration = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Reader User',
        email: `reader-${databaseName}@example.com`,
        password: 'reader-password-12345',
        role: 'admin',
      },
    })
    assert.equal(registration.status, 201)
    assert.equal(registration.body.data.user.role, 'user')
    assert.equal('password' in registration.body.data.user, false)
    const userToken = registration.body.data.token
    assert.equal((await request('/auth/me', { token: userToken })).status, 200)
    assert.equal('authVersion' in (await request('/auth/me', { token: userToken })).body.data.user, false)
    const duplicateRegistration = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Reader User',
        email: `reader-${databaseName}@example.com`,
        password: 'reader-password-12345',
      },
    })
    assert.equal(duplicateRegistration.status, 409)

    const deniedWrite = await request('/articles', {
      method: 'POST',
      token: userToken,
      body: { title: 'Forbidden article' },
    })
    assert.equal(deniedWrite.status, 403)

    const categoryResult = await request('/categories', {
      method: 'POST',
      token: adminToken,
      body: { name: 'Digital Health', type: 'article' },
    })
    assert.equal(categoryResult.status, 201)
    const articleCategoryId = categoryResult.body.data._id
    assert.equal((await request('/categories?type=article', { token: adminToken })).body.data[0].isActive, true)
    assert.equal((await request(`/categories/${articleCategoryId}`, {
      method: 'PUT',
      token: adminToken,
      body: { isActive: false },
    })).status, 200)
    assert.equal((await request('/categories?type=article')).body.pagination.total, 0)
    assert.equal((await request(`/categories/${articleCategoryId}`, {
      method: 'PUT',
      token: adminToken,
      body: { isActive: true },
    })).status, 200)
    const podcastCategoryResult = await request('/categories', {
      method: 'POST',
      token: adminToken,
      body: { name: 'Podcast Series', type: 'podcast' },
    })
    assert.equal(podcastCategoryResult.status, 201)
    const podcastCategoryId = podcastCategoryResult.body.data._id
    const eventCategoryResult = await request('/categories', {
      method: 'POST',
      token: adminToken,
      body: { name: 'Community Events', type: 'event' },
    })
    assert.equal(eventCategoryResult.status, 201)
    const eventCategoryId = eventCategoryResult.body.data._id
    const glossaryCategoryResult = await request('/categories', {
      method: 'POST',
      token: adminToken,
      body: { name: 'HealthTech Concepts', type: 'glossary' },
    })
    assert.equal(glossaryCategoryResult.status, 201)
    const glossaryCategoryId = glossaryCategoryResult.body.data._id

    const wrongCategoryType = await request('/articles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'Article with mismatched category',
        excerpt: 'A useful look at better connected care.',
        content: 'This article includes enough original editorial content for the integration test.',
        category: podcastCategoryId,
      },
    })
    assert.equal(wrongCategoryType.status, 400)

    const article = await request('/articles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'A practical digital health story',
        excerpt: 'A useful look at better connected care.',
        content: 'This article includes enough original editorial content for the integration test.',
        category: articleCategoryId,
        status: 'published',
      },
    })
    assert.equal(article.status, 201)
    const articleId = article.body.data._id
    const duplicateArticle = await request('/articles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'Another digital health story',
        slug: article.body.data.slug,
        excerpt: 'A useful look at better connected care.',
        content: 'This duplicate article includes enough content to pass request validation.',
        category: articleCategoryId,
      },
    })
    assert.equal(duplicateArticle.status, 409)

    const draft = await request('/articles', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'A draft editorial story',
        excerpt: 'A useful draft for administrator review.',
        content: 'This draft includes enough original content for the integration test.',
        category: articleCategoryId,
      },
    })
    assert.equal(draft.status, 201)
    assert.equal((await request(`/categories/${articleCategoryId}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 409)
    assert.equal((await request('/articles')).body.pagination.total, 1)
    assert.equal((await request('/articles?status=draft', { token: adminToken })).body.pagination.total, 1)
    assert.equal((await request(`/articles/${draft.body.data.slug}`)).status, 404)
    assert.equal((await request(`/articles/${draft.body.data.slug}`, { token: adminToken })).status, 200)
    const search = await request('/articles?search=connected')
    assert.equal(search.status, 200)
    assert.equal(search.body.pagination.total, 1)
    assert.equal((await request(`/articles/${article.body.data.slug}`)).status, 200)
    const updatedArticle = await request(`/articles/${articleId}`, {
      method: 'PUT',
      token: adminToken,
      body: { title: 'An updated digital health story' },
    })
    assert.equal(updatedArticle.status, 200)

    const podcast = await request('/podcasts', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'HealthTech conversations',
        description: 'A conversation with health technology leaders.',
        host: 'Editorial team',
        category: podcastCategoryId,
        status: 'published',
      },
    })
    assert.equal(podcast.status, 201)
    assert.equal((await request('/podcasts')).body.pagination.total, 1)
    const podcastId = podcast.body.data._id
    assert.equal((await request(`/podcasts/${podcast.body.data._id}`, {
      method: 'PUT',
      token: adminToken,
      body: { duration: 28 },
    })).status, 200)
    const glossary = await request('/glossary', {
      method: 'POST',
      token: adminToken,
      body: {
        term: 'Digital care',
        definition: 'Healthcare supported by digital tools and services.',
        category: glossaryCategoryId,
      },
    })
    assert.equal(glossary.status, 201)
    const linkedPodcast = await request(`/podcasts/${podcastId}`, {
      method: 'PUT',
      token: adminToken,
      body: { company: companyId, relatedTerms: [glossary.body.data._id] },
    })
    assert.equal(linkedPodcast.status, 200)
    const podcastDetail = await request(`/podcasts/${podcastId}`)
    assert.equal(podcastDetail.body.data.company.name, company.body.data.name)
    assert.equal(podcastDetail.body.data.relatedTerms[0].term, glossary.body.data.term)
    assert.equal((await request('/glossary')).body.pagination.total, 1)
    assert.equal((await request(`/glossary?category=${glossaryCategoryResult.body.data.slug}`)).body.pagination.total, 1)
    assert.equal((await request('/glossary', {
      method: 'POST',
      token: adminToken,
      body: {
        term: 'Invalid glossary category',
        definition: 'Healthcare supported by digital tools and services.',
        category: articleCategoryId,
      },
    })).status, 400)
    const contact = await request('/contact', {
      method: 'POST',
      body: {
        name: 'Integration Contact',
        email: 'contact@example.com',
        message: 'A valid contact request saved by the integration test.',
      },
    })
    assert.equal(contact.status, 201)
    assert.equal((await request('/admin/contact-messages', { token: adminToken })).body.pagination.total, 1)
    assert.equal((await request('/admin/contact-messages', { token: userToken })).status, 403)
    assert.equal((await request(`/glossary/${glossary.body.data._id}`, {
      method: 'PUT',
      token: adminToken,
      body: { definition: 'Care supported by useful digital tools and services.' },
    })).status, 200)
    assert.equal((await request(`/glossary/${glossary.body.data._id}`, {
      method: 'PUT',
      token: adminToken,
      body: { relatedTerms: [glossary.body.data._id] },
    })).status, 400)

    const event = await request('/events', {
      method: 'POST',
      token: adminToken,
      body: {
        title: 'HealthTech community session',
        description: 'A future community event for the integration test.',
        location: 'Online',
        eventDate: new Date(Date.now() + 86400000).toISOString(),
        category: eventCategoryId,
        status: 'published',
      },
    })
    assert.equal(event.status, 201)
    assert.equal((await request('/events')).body.pagination.total, 1)

    const subscribeBody = { email: `newsletter-${databaseName}@example.com` }
    assert.equal((await request('/newsletter/subscribe', { method: 'POST', body: subscribeBody })).status, 200)
    assert.equal((await request('/newsletter/subscribe', { method: 'POST', body: subscribeBody })).status, 200)
    const subscribers = await request('/admin/newsletter-subscribers', { token: adminToken })
    assert.equal(subscribers.status, 200)
    assert.equal(subscribers.body.pagination.total, 1)
    assert.equal((await request('/admin/newsletter-subscribers', { token: userToken })).status, 403)
    const savedSubscription = await Newsletter.findOne({ email: subscribeBody.email }).select('+unsubscribeToken')
    assert.equal((await request('/admin/newsletter-campaign', {
      method: 'POST',
      token: adminToken,
      body: { subject: 'A weekly healthtech update', content: 'A sufficiently long message for newsletter validation.' },
    })).status, 503)
    assert.equal((await request('/newsletter/unsubscribe', {
      method: 'POST',
      body: { token: savedSubscription.unsubscribeToken },
    })).status, 200)

    assert.equal((await request('/articles/not-an-id', {
      method: 'PUT',
      token: adminToken,
      body: { title: 'Invalid identifier' },
    })).status, 400)
    assert.equal((await request(`/articles/${draft.body.data._id}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/articles/${articleId}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/glossary/${glossary.body.data._id}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/events/${event.body.data._id}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/podcasts/${podcastId}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/jobs/${job.body.data._id}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)
    assert.equal((await request(`/companies/${companyId}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)

    const unusedCategory = await request('/categories', {
      method: 'POST',
      token: adminToken,
      body: { name: 'Unused category', type: 'article' },
    })
    assert.equal((await request(`/categories/${unusedCategory.body.data._id}`, {
      method: 'PUT',
      token: adminToken,
      body: { description: 'Updated category details' },
    })).status, 200)
    assert.equal((await request(`/categories/${unusedCategory.body.data._id}`, {
      method: 'DELETE',
      token: adminToken,
    })).status, 200)

    const profile = await request('/auth/update-profile', {
      method: 'PUT',
      token: userToken,
      body: { name: 'Reader Updated', role: 'admin' },
    })
    assert.equal(profile.status, 200)
    assert.equal(profile.body.data.user.role, 'user')
    const passwordChange = await request('/auth/change-password', {
      method: 'PUT',
      token: userToken,
      body: { currentPassword: 'reader-password-12345', newPassword: 'new-reader-password-678' },
    })
    assert.equal(passwordChange.status, 200)
    assert.equal((await request('/auth/me', { token: userToken })).status, 401)
    const refreshedToken = passwordChange.body.data.token
    assert.equal((await request('/auth/me', { token: refreshedToken })).status, 200)
    assert.equal((await request('/auth/login', {
      method: 'POST',
      body: { email: `reader-${databaseName}@example.com`, password: 'new-reader-password-678' },
    })).status, 200)
    assert.equal((await request('/auth/logout', { method: 'POST', token: refreshedToken })).status, 200)
    assert.equal((await request('/auth/me', { token: refreshedToken })).status, 401)
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve))
    if (databaseConnected) await mongoose.connection.dropDatabase()
    await mongoose.disconnect()
  }
})
