import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listCategories } from '../../services/categoryService'
import { getGlossaryTerm, listGlossaryTerms } from '../../services/glossaryService'
import styles from '../Page.module.css'

const loadGlossaryCategories = (_key, signal) => listCategories({ type: 'glossary', limit: 100 }, signal)

function Glossary() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const { data: result, loading, error, reload } = useRemoteResource(listGlossaryTerms, searchParams.toString(), !slug)
  const { data: categories } = useRemoteResource(loadGlossaryCategories, '', !slug)
  const { data: term, loading: detailLoading, error: detailError, reload: reloadDetail } = useRemoteResource(getGlossaryTerm, slug ?? '', Boolean(slug))

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
    if (detailError || !term) {
      return <section className={`site-container ${styles.pageContent}`}><ContentStatus error={detailError || 'Glossary term not found.'} onRetry={reloadDetail} /><Button href="/glossary" variant="secondary">Back to glossary</Button></section>
    }

    return (
      <article className={`site-container ${styles.articleBody}`}>
        <Link className={styles.backLink} to="/glossary"><i className="bi bi-arrow-left" aria-hidden="true" /> All terms</Link>
        {term.category?.name && <p className={styles.definitionCategory}>{term.category.name}</p>}
        <h1>{term.term}</h1>
        <p className={styles.articleLead}>{term.definition}</p>
        {term.relatedTerms?.length > 0 && (
          <section aria-labelledby="related-terms-heading">
            <h2 id="related-terms-heading">Related terms</h2>
            <ul>{term.relatedTerms.map((relatedId) => <li key={relatedId}><Link to={`/glossary/${relatedId}`}>View related term</Link></li>)}</ul>
          </section>
        )}
      </article>
    )
  }

  const terms = result?.items ?? []
  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>The language of healthtech</p><h1>HealthTech, in plain English.</h1><p>A growing guide to the ideas, terms and technologies changing how we care for one another.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <div className={styles.listControls}>
          <form className={styles.contentFilters} role="search" onSubmit={(event) => {
            event.preventDefault()
            updateParams({ search: searchInput.trim() })
          }}>
            <label htmlFor="glossary-search">Search terms</label>
            <div className={styles.searchRow}><input id="glossary-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search the glossary…" /><Button type="submit">Search</Button></div>
          </form>
          <label className={styles.contentFilters} htmlFor="glossary-category">Category
            <select id="glossary-category" value={searchParams.get('category') ?? ''} onChange={(event) => updateParams({ category: event.target.value })}>
              <option value="">All categories</option>
              {(categories ?? []).map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
        </div>
        {loading && <ContentStatus loading skeletonCount={4} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !terms.length && <ContentStatus empty emptyMessage="No terms match your search." />}
        {!loading && !error && terms.length > 0 && (
          <>
            <dl className={styles.definitionList}>
              {terms.map((item) => (
                <div key={item._id}>
                  <dt><h2><Link to={`/glossary/${item.slug}`}>{item.term}</Link></h2></dt>
                  {item.category?.name && <p className={styles.definitionCategory}>{item.category.name}</p>}
                  <dd><p>{item.definition}</p></dd>
                </div>
              ))}
            </dl>
            <Pagination pagination={result.pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Glossary
