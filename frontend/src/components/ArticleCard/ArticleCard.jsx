import { Link } from 'react-router-dom'
import { fallbackImage } from '../../utils/contentFormatters'
import styles from './ArticleCard.module.css'

function ArticleCard({ article, featured = false }) {
  return (
    <article className={`${styles.card} ${featured ? styles.featured : ''}`}>
      <Link className={styles.imageLink} to={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}>
        <img
          className={styles.image}
          src={article.image}
          alt={article.imageAlt || `Illustration for ${article.title}`}
          width="720"
          height="480"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = fallbackImage
          }}
        />
      </Link>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.category}>{article.category}</span>
          <span>{article.date}</span>
        </div>
        <h3><Link to={`/articles/${article.slug}`}>{article.title}</Link></h3>
        <p>{article.excerpt}</p>
        <div className={styles.byline}>
          <span>{article.author}</span><span aria-hidden="true">·</span><span>{article.readTime} min read</span>
        </div>
      </div>
    </article>
  )
}

export default ArticleCard
