import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listContactMessages, listNewsletterSubscribers, sendNewsletterCampaign } from '../../services/adminService'
import {
  createAdminContent,
  deleteAdminContent,
  listAdminContent,
  updateAdminContent,
} from '../../services/adminContentService'
import { listCategories } from '../../services/categoryService'
import { listCompanies } from '../../services/companyService'
import { listGlossaryTerms } from '../../services/glossaryService'
import styles from '../Page.module.css'
import adminStyles from './Admin.module.css'

const contentTabs = {
  articles: { label: 'Articles', singular: 'article', categoryType: 'article' },
  podcasts: { label: 'Podcasts', singular: 'podcast', categoryType: 'podcast' },
  events: { label: 'Events', singular: 'event', categoryType: 'event' },
  glossary: { label: 'Glossary', singular: 'term', categoryType: 'glossary' },
  categories: { label: 'Categories', singular: 'category' },
  companies: { label: 'Companies', singular: 'company' },
  jobs: { label: 'Jobs', singular: 'job' },
  contactMessages: { label: 'Contact messages', singular: 'message' },
  subscribers: { label: 'Subscribers', singular: 'subscriber' },
}

const contentFields = {
  articles: [
    { name: 'title', label: 'Title', required: true },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
    { name: 'content', label: 'Article content', type: 'textarea', required: true },
    { name: 'category', label: 'Category', type: 'category', required: true },
    { name: 'featuredImage', label: 'Featured image URL', type: 'url' },
    { name: 'tags', label: 'Tags', type: 'list' },
    { name: 'status', label: 'Status', type: 'status' },
  ],
  podcasts: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'host', label: 'Host', required: true },
    { name: 'guests', label: 'Guests', type: 'list' },
    { name: 'category', label: 'Category', type: 'category' },
    { name: 'company', label: 'Featured company', type: 'company' },
    { name: 'relatedTerms', label: 'Related glossary terms', type: 'relatedTerms' },
    { name: 'thumbnail', label: 'Thumbnail URL', type: 'url' },
    { name: 'audioUrl', label: 'Audio URL', type: 'url' },
    { name: 'videoUrl', label: 'Video URL', type: 'url' },
    { name: 'duration', label: 'Duration (minutes)', type: 'number' },
    { name: 'status', label: 'Status', type: 'status' },
  ],
  events: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'eventDate', label: 'Date and time', type: 'datetime-local', required: true },
    { name: 'location', label: 'Location', required: true },
    { name: 'category', label: 'Category', type: 'category' },
    { name: 'image', label: 'Image URL', type: 'url' },
    { name: 'registrationUrl', label: 'Registration URL', type: 'url' },
    { name: 'status', label: 'Status', type: 'eventStatus' },
  ],
  glossary: [
    { name: 'term', label: 'Term', required: true },
    { name: 'definition', label: 'Definition', type: 'textarea', required: true },
    { name: 'category', label: 'Category', type: 'category' },
  ],
  categories: [
    { name: 'name', label: 'Name', required: true },
    { name: 'type', label: 'Content type', type: 'categoryType', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'isActive', label: 'Visible to the public', type: 'checkbox' },
  ],
  companies: [
    { name: 'name', label: 'Company name', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'sector', label: 'Sector' },
    { name: 'location', label: 'Location' },
    { name: 'website', label: 'Website URL', type: 'url' },
    { name: 'logo', label: 'Logo URL', type: 'url' },
    { name: 'tags', label: 'Tags', type: 'list' },
    { name: 'status', label: 'Status', type: 'status' },
  ],
  jobs: [
    { name: 'title', label: 'Job title', required: true },
    { name: 'company', label: 'Company', type: 'company', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'location', label: 'Location', required: true },
    { name: 'employmentType', label: 'Employment type', type: 'employmentType', required: true },
    { name: 'workplaceType', label: 'Workplace', type: 'workplaceType' },
    { name: 'salaryRange', label: 'Salary range' },
    { name: 'applicationUrl', label: 'Application URL', type: 'url', required: true },
    { name: 'closingDate', label: 'Closing date', type: 'date' },
    { name: 'status', label: 'Status', type: 'status' },
  ],
}

const statusChoices = {
  status: ['draft', 'published'],
  eventStatus: ['draft', 'published', 'cancelled'],
  employmentType: ['full-time', 'part-time', 'contract', 'casual', 'internship'],
  workplaceType: ['onsite', 'hybrid', 'remote'],
}

function loadAdminItems(key, signal) {
  const [type, queryString] = key.split('|')
  return listAdminContent(type, Object.fromEntries(new URLSearchParams(queryString)), signal)
}

function initialForm(type, item = null) {
  return Object.fromEntries((contentFields[type] ?? []).map(({ name, type: fieldType }) => {
    let value = item?.[name] ?? ''
    if (!item && (fieldType === 'status' || fieldType === 'eventStatus')) value = 'draft'
    if (!item && fieldType === 'categoryType') value = 'article'
    if (!item && fieldType === 'employmentType') value = 'full-time'
    if (!item && fieldType === 'workplaceType') value = 'onsite'
    if (!item && fieldType === 'number') value = '0'
    if (!item && fieldType === 'checkbox') value = true
    if (name === 'category' || name === 'company') value = item?.[name]?._id ?? item?.[name] ?? ''
    if (fieldType === 'relatedTerms') value = item?.relatedTerms?.map((term) => term._id ?? term) ?? []
    if (fieldType === 'list') value = Array.isArray(value) ? value.join(', ') : value
    if (['datetime-local', 'date'].includes(fieldType) && value) {
      const date = new Date(value)
      const localDate = Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
      value = localDate ? localDate.slice(0, fieldType === 'date' ? 10 : 16) : ''
    }
    return [name, value]
  }))
}

function toPayload(type, form) {
  const payload = { ...form }
  for (const field of contentFields[type]) {
    if (field.type === 'list') {
      payload[field.name] = String(form[field.name] ?? '').split(',').map((item) => item.trim()).filter(Boolean)
    } else if (field.type === 'relatedTerms') {
      payload[field.name] = form[field.name] ?? []
    } else if (field.type === 'number') {
      payload[field.name] = Number(form[field.name] || 0)
    } else if (field.type === 'datetime-local') {
      payload[field.name] = new Date(form[field.name]).toISOString()
    } else if (field.type === 'date') {
      payload[field.name] = form[field.name] ? new Date(`${form[field.name]}T00:00:00`).toISOString() : null
    } else if (field.type === 'category' && !form[field.name]) {
      payload[field.name] = null
    }
  }
  return payload
}

function itemTitle(type, item) {
  if (type === 'glossary') return item.term
  return item.title ?? item.name ?? item.email
}

function Admin() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.toString()
  const [activeTab, setActiveTab] = useState('articles')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState({})
  const [categoryState, setCategoryState] = useState({ type: '', items: [], error: '' })
  const [companyState, setCompanyState] = useState({ items: [], error: '' })
  const [relatedTermsState, setRelatedTermsState] = useState({ items: [], error: '' })
  const [mutationError, setMutationError] = useState('')
  const [saving, setSaving] = useState(false)
  const [campaign, setCampaign] = useState({ subject: '', content: '' })
  const [campaignStatus, setCampaignStatus] = useState({ message: '', error: '' })
  const [sendingCampaign, setSendingCampaign] = useState(false)
  const [reloadNumber, setReloadNumber] = useState(0)
  const isSubscriberTab = activeTab === 'subscribers'
  const isContactTab = activeTab === 'contactMessages'
  const isSpecialTab = isSubscriberTab || isContactTab
  const { data: contentResult, loading: contentLoading, error: contentError, reload: reloadContent } = useRemoteResource(
    loadAdminItems,
    `${activeTab}|${query}`,
    !isSpecialTab,
  )
  const { data: subscriberResult, loading: subscriberLoading, error: subscriberError, reload: reloadSubscribers } = useRemoteResource(
    listNewsletterSubscribers,
    query,
    isSubscriberTab,
  )
  const { data: contactResult, loading: contactLoading, error: contactError, reload: reloadContacts } = useRemoteResource(
    listContactMessages,
    query,
    isContactTab,
  )
  const result = isSubscriberTab ? subscriberResult : isContactTab ? contactResult : contentResult
  const loading = isSubscriberTab ? subscriberLoading : isContactTab ? contactLoading : contentLoading
  const error = isSubscriberTab ? subscriberError : isContactTab ? contactError : contentError
  const reload = isSubscriberTab ? reloadSubscribers : isContactTab ? reloadContacts : reloadContent
  const activeContent = contentTabs[activeTab]
  const fields = contentFields[activeTab] ?? []
  const categories = categoryState.type === activeContent.categoryType ? categoryState.items : []
  const categoriesError = categoryState.type === activeContent.categoryType ? categoryState.error : ''
  const companies = companyState.items
  const relatedTerms = relatedTermsState.items

  useEffect(() => {
    const categoryType = contentTabs[activeTab]?.categoryType
    if (!categoryType) return undefined

    const controller = new AbortController()
    listCategories({ type: categoryType, page: 1, limit: 100 }, controller.signal)
      .then((items) => setCategoryState({ type: categoryType, items, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setCategoryState({ type: categoryType, items: [], error: requestError.message || 'Unable to load categories.' })
        }
      })
    return () => controller.abort()
  }, [activeTab, reloadNumber])

  useEffect(() => {
    if (!['jobs', 'podcasts'].includes(activeTab)) return undefined

    const controller = new AbortController()
    listCompanies('page=1&limit=100', controller.signal)
      .then((result) => setCompanyState({ items: result.items, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setCompanyState({ items: [], error: requestError.message || 'Unable to load companies.' })
      })
    return () => controller.abort()
  }, [activeTab, reloadNumber])

  useEffect(() => {
    if (activeTab !== 'podcasts') return undefined

    const controller = new AbortController()
    listGlossaryTerms('page=1&limit=100', controller.signal)
      .then((result) => setRelatedTermsState({ items: result.items, error: '' }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setRelatedTermsState({ items: [], error: requestError.message || 'Unable to load glossary terms.' })
        }
      })
    return () => controller.abort()
  }, [activeTab, reloadNumber])

  function changePage(page) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  function startCreate() {
    setEditingItem(null)
    setForm(initialForm(activeTab))
    setMutationError('')
    setEditorOpen(true)
  }

  function startEdit(item) {
    setEditingItem(item)
    setForm(initialForm(activeTab, item))
    setMutationError('')
    setEditorOpen(true)
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submitCampaign(event) {
    event.preventDefault()
    if (!window.confirm('Send this newsletter to every active subscriber?')) return
    setSendingCampaign(true)
    setCampaignStatus({ message: '', error: '' })
    try {
      const response = await sendNewsletterCampaign(campaign)
      setCampaignStatus({ message: response.message, error: '' })
      setCampaign({ subject: '', content: '' })
    } catch (requestError) {
      setCampaignStatus({ message: '', error: requestError.message || 'Unable to send the newsletter campaign.' })
    } finally {
      setSendingCampaign(false)
    }
  }

  async function saveContent(event) {
    event.preventDefault()
    setSaving(true)
    setMutationError('')
    try {
      const payload = toPayload(activeTab, form)
      if (editingItem) await updateAdminContent(activeTab, editingItem._id, payload)
      else await createAdminContent(activeTab, payload)
      setEditorOpen(false)
      setEditingItem(null)
      setReloadNumber((number) => number + 1)
      reload()
    } catch (requestError) {
      setMutationError(requestError.message || `Unable to save ${activeContent.singular}.`)
    } finally {
      setSaving(false)
    }
  }

  async function removeItem(item) {
    if (!window.confirm(`Delete “${itemTitle(activeTab, item)}”? This cannot be undone.`)) return
    setMutationError('')
    try {
      await deleteAdminContent(activeTab, item._id)
      setReloadNumber((number) => number + 1)
      reload()
    } catch (requestError) {
      setMutationError(requestError.message || `Unable to delete ${activeContent.singular}.`)
    }
  }

  function renderField(field) {
    const value = form[field.name] ?? ''
    if (field.type === 'category') {
      return (
        <select id={`admin-${field.name}`} value={value} required={field.required} onChange={(event) => updateField(field.name, event.target.value)}>
          <option value="">No category</option>
          {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
        </select>
      )
    }
    if (field.type === 'company') {
      return (
        <select id={`admin-${field.name}`} value={value} required onChange={(event) => updateField(field.name, event.target.value)}>
          <option value="">Select a company</option>
          {companies.map((company) => <option key={company._id} value={company._id}>{company.name}</option>)}
        </select>
      )
    }
    if (field.type === 'relatedTerms') {
      return (
        <select id={`admin-${field.name}`} value={value} multiple onChange={(event) => {
          updateField(field.name, Array.from(event.target.selectedOptions, (option) => option.value))
        }}>
          {relatedTerms.map((term) => <option key={term._id} value={term._id}>{term.term}</option>)}
        </select>
      )
    }
    if (field.type === 'checkbox') {
      return <input id={`admin-${field.name}`} type="checkbox" checked={Boolean(value)} onChange={(event) => updateField(field.name, event.target.checked)} />
    }
    if (['status', 'eventStatus', 'employmentType', 'workplaceType'].includes(field.type)) {
      return (
        <select id={`admin-${field.name}`} value={value || statusChoices[field.type][0]} onChange={(event) => updateField(field.name, event.target.value)}>
          {statusChoices[field.type].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      )
    }
    if (field.type === 'categoryType') {
      return (
        <select id={`admin-${field.name}`} value={value} required onChange={(event) => updateField(field.name, event.target.value)}>
          {['article', 'podcast', 'event', 'glossary'].map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      )
    }
    const inputType = field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : ['datetime-local', 'date'].includes(field.type) ? field.type : 'text'
    if (field.type === 'textarea') {
      return <textarea id={`admin-${field.name}`} value={value} required={field.required} onChange={(event) => updateField(field.name, event.target.value)} />
    }
    return (
      <input
        id={`admin-${field.name}`}
        type={inputType}
        min={field.type === 'number' ? '0' : undefined}
        required={field.required}
        value={value}
        onChange={(event) => updateField(field.name, event.target.value)}
      />
    )
  }

  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>Administration</p><h1>Manage Talking HealthTech</h1><p>Create, update, publish, and remove site content. These tools are available to administrator accounts only.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <nav className={adminStyles.tabs} aria-label="Admin sections">
          {Object.entries(contentTabs).map(([key, tab]) => (
            <button key={key} type="button" className={activeTab === key ? adminStyles.activeTab : ''} aria-current={activeTab === key ? 'page' : undefined} onClick={() => {
              setActiveTab(key)
              setEditorOpen(false)
              setMutationError('')
            }}>{tab.label}</button>
          ))}
        </nav>
        {isSpecialTab
          ? <h2 className={adminStyles.sectionTitle}>{activeContent.label}</h2>
          : (
            <div className={adminStyles.contentHeading}>
              <h2>{activeContent.label}</h2>
              <Button type="button" onClick={startCreate}>Add {activeContent.singular}</Button>
            </div>
          )}
        {categoriesError && <p className={adminStyles.error} role="alert">{categoriesError}</p>}
        {['jobs', 'podcasts'].includes(activeTab) && companyState.error && <p className={adminStyles.error} role="alert">{companyState.error}</p>}
        {activeTab === 'podcasts' && relatedTermsState.error && <p className={adminStyles.error} role="alert">{relatedTermsState.error}</p>}
        {mutationError && <p className={adminStyles.error} role="alert">{mutationError}</p>}
        {!isSpecialTab && editorOpen && (
          <form className={adminStyles.editor} onSubmit={saveContent}>
            <h3>{editingItem ? `Edit ${activeContent.singular}` : `New ${activeContent.singular}`}</h3>
            {fields.map((field) => (
              <label className={field.type === 'textarea' ? adminStyles.wideField : ''} key={field.name} htmlFor={`admin-${field.name}`}>
                {field.label}{field.required && <span aria-hidden="true"> *</span>}
                {field.type === 'list' && <small>Separate values with commas.</small>}
                {renderField(field)}
              </label>
            ))}
            <div className={adminStyles.editorActions}>
              <Button type="submit" disabled={saving || Boolean(categoriesError) || (['jobs', 'podcasts'].includes(activeTab) && Boolean(companyState.error || (activeTab === 'podcasts' && relatedTermsState.error)))}>{saving ? 'Saving…' : editingItem ? 'Save changes' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
        {isSubscriberTab && (
          <form className={adminStyles.campaignForm} onSubmit={submitCampaign}>
            <h3>Send a newsletter</h3>
            <p>This sends the message individually to all active subscribers. Email delivery requires the SMTP settings on the backend.</p>
            <label htmlFor="campaign-subject">Subject
              <input id="campaign-subject" value={campaign.subject} minLength="4" maxLength="160" required onChange={(event) => setCampaign({ ...campaign, subject: event.target.value })} />
            </label>
            <label htmlFor="campaign-content">Message
              <textarea id="campaign-content" value={campaign.content} minLength="20" maxLength="10000" required onChange={(event) => setCampaign({ ...campaign, content: event.target.value })} />
            </label>
            {campaignStatus.error && <p className={adminStyles.error} role="alert">{campaignStatus.error}</p>}
            {campaignStatus.message && <p role="status">{campaignStatus.message}</p>}
            <Button type="submit" disabled={sendingCampaign}>{sendingCampaign ? 'Sending…' : 'Send to subscribers'}</Button>
          </form>
        )}
        {loading && <ContentStatus loading skeletonCount={3} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !result?.items.length && <ContentStatus empty emptyMessage={isSubscriberTab ? 'There are no newsletter subscribers yet.' : isContactTab ? 'There are no contact messages.' : `There are no ${activeContent.label.toLowerCase()} yet.`} />}
        {!loading && !error && result?.items.length > 0 && (
          <>
            {isSpecialTab ? (
              <div className={styles.subscriberTableWrap}>
                <table className={styles.subscriberTable}>
                  {isSubscriberTab ? (
                    <>
                      <thead><tr><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Subscribed</th></tr></thead>
                      <tbody>{result.items.map((subscriber) => (
                        <tr key={subscriber._id}>
                          <td>{subscriber.email}</td>
                          <td>{subscriber.isSubscribed ? 'Subscribed' : 'Unsubscribed'}</td>
                          <td>{subscriber.subscribedAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(subscriber.subscribedAt)) : '—'}</td>
                        </tr>
                      ))}</tbody>
                    </>
                  ) : (
                    <>
                      <thead><tr><th scope="col">From</th><th scope="col">Message</th><th scope="col">Received</th></tr></thead>
                      <tbody>{result.items.map((entry) => (
                        <tr key={entry._id}>
                          <td>{entry.name}<br /><a href={`mailto:${entry.email}`}>{entry.email}</a></td>
                          <td><details><summary>Read message</summary><p>{entry.message}</p></details></td>
                          <td>{entry.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(entry.createdAt)) : '—'}</td>
                        </tr>
                      ))}</tbody>
                    </>
                  )}
                </table>
              </div>
            ) : (
              <div className={styles.subscriberTableWrap}>
                <table className={styles.subscriberTable}>
                  <thead><tr><th scope="col">Title</th><th scope="col">Status / type</th><th scope="col">Actions</th></tr></thead>
                  <tbody>{result.items.map((item) => (
                    <tr key={item._id}>
                      <td>{itemTitle(activeTab, item)}</td>
                      <td>{activeTab === 'categories' ? `${item.type} · ${item.isActive ? 'active' : 'inactive'}` : item.status ?? 'Published'}</td>
                      <td className={adminStyles.rowActions}>
                        <button type="button" onClick={() => startEdit(item)}>Edit</button>
                        <button type="button" className={adminStyles.deleteButton} onClick={() => removeItem(item)}>Delete</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            <Pagination pagination={result.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Admin
