import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import PodcastCard from '../../components/PodcastCard/PodcastCard'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listCategories } from '../../services/categoryService'
import { getPodcast, listPodcasts } from '../../services/podcastService'
import { fallbackImage, formatDateTime, toPodcastCard } from '../../utils/contentFormatters'
import styles from '../Page.module.css'

const loadPodcastCategories = (_key, signal) => listCategories({ type: 'podcast', limit: 100 }, signal)

function Podcasts() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const { data: result, loading, error, reload } = useRemoteResource(listPodcasts, searchParams.toString(), !slug)
  const { data: categories } = useRemoteResource(loadPodcastCategories, '', !slug)
  const { data: podcast, loading: detailLoading, error: detailError, reload: reloadDetail } = useRemoteResource(getPodcast, slug ?? '', Boolean(slug))

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
    if (detailError || !podcast) {
      return <section className={`site-container ${styles.pageContent}`}><ContentStatus error={detailError || 'Podcast not found.'} onRetry={reloadDetail} /><Button href="/podcasts" variant="secondary">Back to podcasts</Button></section>
    }

    const episode = toPodcastCard(podcast)
    return (
      <article className={`site-container ${styles.articleBody}`}>
        <Link className={styles.backLink} to="/podcasts"><i className="bi bi-arrow-left" aria-hidden="true" /> All episodes</Link>
        <img src={episode.image} alt={episode.imageAlt} width="1200" height="750" fetchPriority="high" onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = fallbackImage
        }} />
        <div className={styles.articleMeta}><span>{episode.series}</span><span>{formatDateTime(podcast.publishedAt ?? podcast.createdAt)}</span><span>{episode.duration}</span></div>
        <h1>{podcast.title}</h1>
        <p className={styles.articleLead}>{podcast.description}</p>
        {podcast.host && <p><strong>Hosted by {podcast.host}</strong>{podcast.guests?.length ? ` · Featuring ${podcast.guests.join(', ')}` : ''}</p>}
        {podcast.company?.slug && <p>Featuring <Link to={`/directory/${podcast.company.slug}`}>{podcast.company.name}</Link></p>}
        {podcast.relatedTerms?.length > 0 && (
          <section aria-labelledby="podcast-related-terms">
            <h2 id="podcast-related-terms">Related healthtech terms</h2>
            <ul>{podcast.relatedTerms.map((term) => <li key={term._id}><Link to={`/glossary/${term.slug}`}>{term.term}</Link></li>)}</ul>
          </section>
        )}
        {podcast.audioUrl && <audio className={styles.mediaPlayer} controls preload="none" src={podcast.audioUrl}>Your browser does not support audio playback.</audio>}
        {!podcast.audioUrl && podcast.videoUrl && <p><a href={podcast.videoUrl} target="_blank" rel="noreferrer">Watch this episode <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a></p>}
      </article>
    )
  }

  const episodes = result?.items ?? []
  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>Listen in</p><h1>Conversations for a healthier future.</h1><p>Meet the changemakers, clinicians and curious minds moving health technology forward.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <div className={styles.listControls}>
          <form className={styles.contentFilters} role="search" onSubmit={(event) => {
            event.preventDefault()
            updateParams({ search: searchInput.trim() })
          }}>
            <label htmlFor="podcast-search">Search episodes</label>
            <div className={styles.searchRow}><input id="podcast-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search podcasts…" /><Button type="submit">Search</Button></div>
          </form>
          <label className={styles.contentFilters} htmlFor="podcast-category">Category
            <select id="podcast-category" value={searchParams.get('category') ?? ''} onChange={(event) => updateParams({ category: event.target.value })}>
              <option value="">All categories</option>
              {(categories ?? []).map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
        </div>
        {loading && <ContentStatus loading skeletonCount={3} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !episodes.length && <ContentStatus empty emptyMessage="No podcast episodes match those filters yet." />}
        {!loading && !error && episodes.length > 0 && (
          <>
            <div className={styles.eventList}>{episodes.map((item) => <PodcastCard key={item._id} podcast={toPodcastCard(item)} />)}</div>
            <Pagination pagination={result.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Podcasts
