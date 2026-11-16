import styles from './Pagination.module.css'

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages } = pagination

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <span aria-live="polite">Page {page} of {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  )
}

export default Pagination
