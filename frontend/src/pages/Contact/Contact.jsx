import { useState } from 'react'
import Button from '../../components/Button/Button'
import { sendContactMessage } from '../../services/contactService'
import styles from '../Page.module.css'

function Contact() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await sendContactMessage({
        name: data.get('name'),
        email: data.get('email'),
        message: data.get('message'),
      })
      form.reset()
      setMessage('Thanks for reaching out. Your message has been received.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to send your message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>Get in touch</p><h1>Let’s keep the conversation going.</h1><p>Have a story idea, a question or an opportunity to collaborate? We’d love to hear from you.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" required /></label>
          <label htmlFor="contact-email">Email address<input id="contact-email" name="email" type="email" autoComplete="email" required /></label>
          <label htmlFor="contact-message">How can we help?<textarea id="contact-message" name="message" required /></label>
          <div><Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'} <i className="bi bi-arrow-right" aria-hidden="true" /></Button></div>
          {error && <p className={styles.error} role="alert">{error}</p>}
          {message && <p className={styles.statusMessage} role="status">{message}</p>}
        </form>
        <p className={styles.contactIntro}>Prefer email? <a href="mailto:hello@talkinghealthtech.com">hello@talkinghealthtech.com</a></p>
      </section>
    </>
  )
}

export default Contact
