import Button from '../Button/Button'
import styles from './ContentStatus.module.css'

function ContentStatus({ loading, error, onRetry, empty, emptyMessage = 'Nothing to show yet.', skeletonCount = 3 }) {
  if (loading) {
    return (
      <div className={styles.skeletonGrid} role="status" aria-label="Loading content">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div className={styles.skeletonCard} key={index}>
            <span className={styles.skeletonImage} />
            <span className={styles.skeletonLine} />
            <span className={`${styles.skeletonLine} ${styles.shortLine}`} />
          </div>
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <div className={styles.message} role="alert">
        <p>{error}</p>
        {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
      </div>
    )
  }
  if (empty) return <div className={styles.message} role="status">{emptyMessage}</div>
  return null
}

export default ContentStatus
