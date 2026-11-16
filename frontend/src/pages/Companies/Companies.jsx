import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listCompanies, getCompany } from '../../services/companyService'
import { listJobs } from '../../services/jobService'
import styles from './Directory.module.css'
import pageStyles from '../Page.module.css'

function Companies() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const query = searchParams.toString()
  const { data: result, loading, error, reload } = useRemoteResource(listCompanies, query, !slug)
  const { data: company, loading: detailLoading, error: detailError, reload: reloadDetail } = useRemoteResource(getCompany, slug ?? '', Boolean(slug))
  const { data: companyJobs, loading: jobsLoading, error: jobsError } = useRemoteResource(
    listJobs,
    company?._id ? `company=${company._id}&limit=10` : '',
    Boolean(slug && company?._id),
  )

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
    if (detailError || !company) {
      return <section className="site-container"><ContentStatus error={detailError || 'Company not found.'} onRetry={reloadDetail} /><Button href="/directory" variant="secondary">Back to companies</Button></section>
    }

    return (
      <article className={`site-container ${styles.detail}`}>
        <Link className={styles.backLink} to="/directory"><i className="bi bi-arrow-left" aria-hidden="true" /> Company directory</Link>
        {company.logo && <img className={styles.logo} src={company.logo} alt={`${company.name} logo`} />}
        <p className={styles.eyebrow}>{company.sector || 'Health technology company'}</p>
        <h1>{company.name}</h1>
        {company.location && <p className={styles.meta}>{company.location}</p>}
        <p className={styles.description}>{company.description}</p>
        {company.tags?.length > 0 && <ul className={styles.tags}>{company.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
        <div className={styles.actions}>
          {company.website && <Button href={company.website} target="_blank" rel="noreferrer">Visit company website</Button>}
          <Button href="/jobs" variant="secondary">Browse healthtech jobs</Button>
        </div>
        <section className={styles.companyJobs} aria-labelledby="company-jobs-heading">
          <h2 id="company-jobs-heading">Open roles</h2>
          {jobsLoading && <ContentStatus loading skeletonCount={2} />}
          {!jobsLoading && jobsError && <ContentStatus error={jobsError} />}
          {!jobsLoading && !jobsError && !companyJobs?.items.length && <p>There are no current roles listed for this company.</p>}
          {!jobsLoading && !jobsError && companyJobs?.items.map((job) => (
            <p key={job._id}><Link to={`/jobs/${job.slug}`}>{job.title}</Link> · {job.location}</p>
          ))}
          <Link to={`/jobs?company=${company._id}`}>See all company jobs</Link>
        </section>
      </article>
    )
  }

  const companies = result?.items ?? []
  return (
    <>
      <header className={styles.hero}><div className="site-container"><p className={styles.eyebrow}>HealthTech ecosystem</p><h1>Companies shaping better care.</h1><p>Explore health technology companies and the ideas they bring to the healthcare community.</p></div></header>
      <section className={`site-container ${styles.listing}`}>
        <form className={pageStyles.contentFilters} role="search" onSubmit={submitSearch}>
          <label htmlFor="company-search">Search companies</label>
          <div className={pageStyles.searchRow}><input id="company-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Company, sector, or location" /><Button type="submit">Search</Button></div>
        </form>
        {loading && <ContentStatus loading skeletonCount={6} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !companies.length && <ContentStatus empty emptyMessage="Company profiles are coming soon." />}
        {!loading && !error && companies.length > 0 && (
          <>
            <div className={styles.grid}>
              {companies.map((item) => (
                <article className={styles.card} key={item._id}>
                  {item.logo && <img className={styles.cardLogo} src={item.logo} alt={`${item.name} logo`} loading="lazy" />}
                  <p className={styles.eyebrow}>{item.sector || 'Health technology'}</p>
                  <h2><Link to={`/directory/${item.slug}`}>{item.name}</Link></h2>
                  {item.location && <p className={styles.meta}>{item.location}</p>}
                  <p>{item.description}</p>
                  <Link className={styles.cardLink} to={`/directory/${item.slug}`}>Company profile <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
            <Pagination pagination={result.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Companies
