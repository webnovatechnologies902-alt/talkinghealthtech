import { Link } from 'react-router-dom'
import { fallbackImage } from '../../utils/contentFormatters'
import styles from './PodcastCard.module.css'

function PodcastCard({ podcast }) {
  return (
    <article className={styles.card}>
      <img
        src={podcast.image}
        alt={podcast.imageAlt || `Podcast artwork for ${podcast.title}`}
        width="160"
        height="160"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.onerror = null
          event.currentTarget.src = fallbackImage
        }}
      />
      <div className={styles.details}>
        <p className={styles.episode}>{podcast.series} <span>·</span> {podcast.duration}</p>
        <h3>{podcast.title}</h3>
        <p className={styles.description}>{podcast.description}</p>
        {podcast.href?.startsWith('/podcasts/') ? (
          <Link to={podcast.href} className={styles.play} aria-label={`View ${podcast.title}`}>
            <i className="bi bi-play-fill" aria-hidden="true" /> View episode
          </Link>
        ) : (
          <a href={podcast.href} className={styles.play} aria-label={`Listen to ${podcast.title}`} target="_blank" rel="noreferrer">
            <i className="bi bi-play-fill" aria-hidden="true" /> Listen to episode
          </a>
        )}
      </div>
    </article>
  )
}

export default PodcastCard
