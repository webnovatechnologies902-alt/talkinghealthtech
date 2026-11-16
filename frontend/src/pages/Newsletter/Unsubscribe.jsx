import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { unsubscribeFromNewsletter } from '../../services/newsletterService'
import styles from '../Page.module.css'

function Unsubscribe() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const result = await unsubscribeFromNewsletter(token)
      setMessage(result.message || 'Your newsletter subscription has been updated.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your subscription.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>Newsletter preferences</p><h1>Unsubscribe from the briefing.</h1><p>Confirm below to stop receiving the Talking HealthTech newsletter.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        {!token && <p className={styles.error} role="alert">This unsubscribe link is missing its secure token. Please use the link from your email.</p>}
        {token && <Button type="button" disabled={submitting || Boolean(message)} onClick={submit}>{submitting ? 'Updating…' : 'Confirm unsubscribe'}</Button>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && <p className={styles.statusMessage} role="status">{message}</p>}
      </section>
    </>
  )
}

export default Unsubscribe
