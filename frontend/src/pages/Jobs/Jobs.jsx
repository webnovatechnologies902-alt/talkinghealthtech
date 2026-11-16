import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { getJob, listJobs } from '../../services/jobService'
import styles from '../Companies/Directory.module.css'
import pageStyles from '../Page.module.css'

function formatClosingDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function Jobs() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const query = searchParams.toString()
  const { data: result, loading, error, reload } = useRemoteResource(listJobs, query, !slug)
  const { data: job, loading: detailLoading, error: detailError, reload: reloadDetail } = useRemoteResource(getJob, slug ?? '', Boolean(slug))

  function changePage(page) {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(page))
    setSearchParams(next)
  }

  function submitSearch(event) {
    event.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput.trim()) next.set('search', searchInput.trim())
    else next.delete('search')
    next.delete('page')
    setSearchParams(next)
  }

  if (slug) {
    if (detailLoading) return <section className="site-container"><ContentStatus loading skeletonCount={1} /></section>
    if (detailError || !job) {
      return <section className="site-container"><ContentStatus error={detailError || 'Job not found.'} onRetry={reloadDetail} /><Button href="/jobs" variant="secondary">Back to jobs</Button></section>
    }

    return (
      <article className={`site-container ${styles.detail}`}>
        <Link className={styles.backLink} to="/jobs"><i className="bi bi-arrow-left" aria-hidden="true" /> All jobs</Link>
        <p className={styles.eyebrow}>{job.employmentType} · {job.workplaceType}</p>
        <h1>{job.title}</h1>
        <p className={styles.meta}>
          {job.company?.slug ? <Link to={`/directory/${job.company.slug}`}>{job.company.name}</Link> : job.company?.name}
          {job.location && ` · ${job.location}`}
        </p>
        {job.salaryRange && <p><strong>Salary:</strong> {job.salaryRange}</p>}
        {job.closingDate && <p><strong>Applications close:</strong> {formatClosingDate(job.closingDate)}</p>}
        <div className={styles.description}>{job.description}</div>
        <Button href={job.applicationUrl} target="_blank" rel="noreferrer">Apply for this role <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></Button>
      </article>
    )
  }

  const jobs = result?.items ?? []
  return (
    <>
      <header className={styles.hero}><div className="site-container"><p className={styles.eyebrow}>HealthTech opportunities</p><h1>Find your next role in digital health.</h1><p>Explore opportunities from companies working to improve healthcare through technology.</p></div></header>
      <section className={`site-container ${styles.listing}`}>
        <form className={pageStyles.contentFilters} role="search" onSubmit={submitSearch}>
          <label htmlFor="job-search">Search jobs</label>
          <div className={pageStyles.searchRow}><input id="job-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Role, company, or location" /><Button type="submit">Search</Button></div>
        </form>
        {loading && <ContentStatus loading skeletonCount={5} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !jobs.length && <ContentStatus empty emptyMessage="There are no current job listings." />}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className={styles.jobList}>
              {jobs.map((item) => (
                <article className={styles.jobCard} key={item._id}>
                  <div>
                    <p className={styles.eyebrow}>{item.employmentType} · {item.workplaceType}</p>
                    <h2><Link to={`/jobs/${item.slug}`}>{item.title}</Link></h2>
                    <p className={styles.meta}>
                      {item.company?.slug ? <Link to={`/directory/${item.company.slug}`}>{item.company.name}</Link> : item.company?.name}
                      {item.location && ` · ${item.location}`}
                    </p>
                    {item.closingDate && <p className={styles.meta}>Closes {formatClosingDate(item.closingDate)}</p>}
                  </div>
                  <Button href={`/jobs/${item.slug}`} variant="secondary">View role</Button>
                </article>
              ))}
            </div>
            <Pagination pagination={result?.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Jobs
