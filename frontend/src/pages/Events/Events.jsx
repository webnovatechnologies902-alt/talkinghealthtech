import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listCategories } from '../../services/categoryService'
import { getEvent, listEvents } from '../../services/eventService'
import { fallbackImage, formatDateTime, toEventCard } from '../../utils/contentFormatters'
import styles from '../Page.module.css'

const loadEventCategories = (_key, signal) => listCategories({ type: 'event', limit: 100 }, signal)

function Events() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const { data: result, loading, error, reload } = useRemoteResource(listEvents, searchParams.toString(), !slug)
  const { data: categories } = useRemoteResource(loadEventCategories, '', !slug)
  const { data: event, loading: detailLoading, error: detailError, reload: reloadDetail } = useRemoteResource(getEvent, slug ?? '', Boolean(slug))

  function updateParams(updates) {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    next.delete('page')
    setSearchParams(next)
  }

  function changePage(page) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  if (slug) {
    if (detailLoading) return <section className={`site-container ${styles.pageContent}`}><ContentStatus loading skeletonCount={1} /></section>
    if (detailError || !event) {
      return <section className={`site-container ${styles.pageContent}`}><ContentStatus error={detailError || 'Event not found.'} onRetry={reloadDetail} /><Button href="/events" variant="secondary">Back to events</Button></section>
    }

    return (
      <article className={`site-container ${styles.articleBody}`}>
        <Link className={styles.backLink} to="/events"><i className="bi bi-arrow-left" aria-hidden="true" /> All events</Link>
        <img src={event.image || fallbackImage} alt={`Event: ${event.title}`} width="1200" height="750" fetchPriority="high" onError={(imageEvent) => {
          imageEvent.currentTarget.onerror = null
          imageEvent.currentTarget.src = fallbackImage
        }} />
        <div className={styles.articleMeta}><span>{event.category?.name ?? event.location}</span><time dateTime={event.eventDate}>{formatDateTime(event.eventDate)}</time></div>
        <h1>{event.title}</h1>
        <p className={styles.articleLead}>{event.description}</p>
        <p><strong>Location:</strong> {event.location}</p>
        {event.registrationUrl
          ? <a className={styles.registrationLink} href={event.registrationUrl} target="_blank" rel="noreferrer">Register for this event <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a>
          : <Button href="/contact">Ask about this event</Button>}
      </article>
    )
  }

  const events = (result?.items ?? []).map(toEventCard)
  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>Meet, learn, connect</p><h1>Ideas are better together.</h1><p>Join conversations and community gatherings exploring what is next for health technology.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <div className={styles.listControls}>
          <form className={styles.contentFilters} role="search" onSubmit={(submitEvent) => {
            submitEvent.preventDefault()
            updateParams({ search: searchInput.trim() })
          }}>
            <label htmlFor="event-search">Search events</label>
            <div className={styles.searchRow}><input id="event-search" type="search" value={searchInput} onChange={(inputEvent) => setSearchInput(inputEvent.target.value)} placeholder="Search events…" /><Button type="submit">Search</Button></div>
          </form>
          <label className={styles.contentFilters} htmlFor="event-category">Category
            <select id="event-category" value={searchParams.get('category') ?? ''} onChange={(inputEvent) => updateParams({ category: inputEvent.target.value })}>
              <option value="">All categories</option>
              {(categories ?? []).map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
        </div>
        {loading && <ContentStatus loading skeletonCount={3} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !events.length && <ContentStatus empty emptyMessage="No upcoming events match those filters." />}
        {!loading && !error && events.length > 0 && (
          <>
            <div className={styles.eventList}>
              {events.map((item) => {
                const date = new Date(item.eventDate)
                return (
                  <article className={styles.eventCard} key={item._id}>
                    <time className={styles.eventDate} dateTime={item.eventDate}><strong>{Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(date)}</strong>{Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date)}</time>
                    <div><p className={styles.eyebrow}>{item.type}</p><h2><Link to={`/events/${item.slug}`}>{item.title}</Link></h2><p>{item.description}</p><p className={styles.eventLocation}>{formatDateTime(item.eventDate)} · {item.location}</p></div>
                    <Button href={`/events/${item.slug}`} variant="secondary">Event details <i className="bi bi-arrow-right" aria-hidden="true" /></Button>
                  </article>
                )
              })}
            </div>
            <Pagination pagination={result.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Events
