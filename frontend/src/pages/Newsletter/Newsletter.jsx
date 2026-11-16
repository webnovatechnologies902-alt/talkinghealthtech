import { useState } from 'react'
import Button from '../../components/Button/Button'
import { subscribeToNewsletter } from '../../services/newsletterService'
import styles from '../Page.module.css'

function Newsletter() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      const result = await subscribeToNewsletter(email.trim())
      setMessage(result.message || 'You’re on the list. Thanks for subscribing.')
      setEmail('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to subscribe right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>The weekly briefing</p><h1>Good healthtech reads, in your inbox.</h1><p>Get a roundup of stories, ideas, events, and conversations shaping healthcare.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <form className={styles.contactForm} onSubmit={submit}>
          <label htmlFor="newsletter-page-email">Email address<input id="newsletter-page-email" type="email" autoComplete="email" maxLength="254" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={submitting} /></label>
          <div><Button type="submit" disabled={submitting}>{submitting ? 'Subscribing…' : 'Subscribe'} <i className="bi bi-arrow-right" aria-hidden="true" /></Button></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          {message && <p className={styles.statusMessage} role="status">{message}</p>}
          <p className={styles.formNote}>If email confirmation is enabled, your message includes a secure unsubscribe link.</p>
        </form>
      </section>
    </>
  )
}

export default Newsletter
