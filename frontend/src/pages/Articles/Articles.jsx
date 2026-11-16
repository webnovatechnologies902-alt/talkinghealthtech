import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ArticleCard from '../../components/ArticleCard/ArticleCard'
import Button from '../../components/Button/Button'
import ContentStatus from '../../components/ContentStatus/ContentStatus'
import Pagination from '../../components/Pagination/Pagination'
import useRemoteResource from '../../hooks/useRemoteResource'
import { listCategories } from '../../services/categoryService'
import { getArticle, listArticles } from '../../services/articleService'
import { fallbackImage, toArticleCard } from '../../utils/contentFormatters'
import styles from '../Page.module.css'

const loadArticleCategories = (_key, signal) => listCategories({ type: 'article', limit: 100 }, signal)

function Articles() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.toString()
  const { data: result, loading, error, reload } = useRemoteResource(listArticles, query, !slug)
  const { data: categories } = useRemoteResource(loadArticleCategories, '', !slug)
  const { data: rawArticle, loading: articleLoading, error: articleError, reload: reloadArticle } = useRemoteResource(getArticle, slug ?? '', Boolean(slug))
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const selectedCategory = searchParams.get('category') ?? ''

  function updateQuery(values) {
    const next = new URLSearchParams(searchParams)
    Object.entries(values).forEach(([key, value]) => {
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
    const article = rawArticle ? toArticleCard(rawArticle) : null
    if (articleLoading) return <section className={`site-container ${styles.pageContent}`}><ContentStatus loading skeletonCount={1} /></section>
    if (articleError || !article) {
      return (
        <section className={`site-container ${styles.pageContent}`}>
          <ContentStatus error={articleError || 'Story not found.'} onRetry={reloadArticle} />
          <Button href="/articles" variant="secondary">Back to stories</Button>
        </section>
      )
    }

    return (
      <article className={`site-container ${styles.articleBody}`}>
        <Link className={styles.backLink} to="/articles"><i className="bi bi-arrow-left" aria-hidden="true" /> All stories</Link>
        <img
          src={article.image}
          alt={article.imageAlt}
          width="1200"
          height="750"
          fetchPriority="high"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = fallbackImage
          }}
        />
        <div className={styles.articleMeta}><span>{article.category}</span><span>{article.date}</span><span>{article.readTime} min read</span></div>
        <h1>{article.title}</h1>
        <p className={styles.articleLead}>{article.excerpt}</p>
        {(rawArticle.content || '').split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={`${rawArticle._id}-${index}`}>{paragraph}</p>)}
        <p><strong>Words by {article.author}</strong></p>
      </article>
    )
  }

  const articles = result?.items ?? []
  const pagination = result?.pagination
  const activeCategory = categories?.find((category) => category.slug === selectedCategory)?.name

  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>News &amp; insights</p><h1>Ideas moving health forward.</h1><p>Reporting, perspectives and practical insight from the people building a healthier, more connected future.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <form className={styles.contentFilters} role="search" onSubmit={(event) => {
          event.preventDefault()
          updateQuery({ search: searchInput.trim() })
        }}>
          <label htmlFor="article-search">Search stories</label>
          <div className={styles.searchRow}>
            <input id="article-search" type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search articles…" />
            <Button type="submit">Search</Button>
          </div>
        </form>
        {searchParams.get('search') && <p role="status">Search results for <strong>“{searchParams.get('search')}”</strong></p>}
        <div className={styles.filters} aria-label="Filter stories by category">
          <button className={`${styles.filter} ${!selectedCategory ? styles.filterActive : ''}`} type="button" aria-pressed={!selectedCategory} onClick={() => updateQuery({ category: '' })}>All stories</button>
          {(categories ?? []).map((category) => (
            <button key={category._id} className={`${styles.filter} ${selectedCategory === category.slug ? styles.filterActive : ''}`} type="button" aria-pressed={selectedCategory === category.slug} onClick={() => updateQuery({ category: category.slug })}>{category.name}</button>
          ))}
        </div>
        {activeCategory && <p>Showing stories in <strong>{activeCategory}</strong></p>}
        {loading && <ContentStatus loading skeletonCount={6} />}
        {!loading && error && <ContentStatus error={error} onRetry={reload} />}
        {!loading && !error && !articles.length && <ContentStatus empty emptyMessage="No stories match those filters. Try another search or category." />}
        {!loading && !error && articles.length > 0 && (
          <>
            <div className={styles.articleGrid}>{articles.map((article) => <ArticleCard key={article._id} article={toArticleCard(article)} />)}</div>
            <Pagination pagination={pagination} onPageChange={changePage} />
          </>
        )}
      </section>
    </>
  )
}

export default Articles
