import { useState } from 'react'
import Button from '../../components/Button/Button'
import useAuth from '../../hooks/useAuth'
import styles from '../Auth/Auth.module.css'

function Profile() {
  const { user, updateProfile, changePassword } = useAuth()
  const [name, setName] = useState(user.name)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submitProfile(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await updateProfile({ name })
      setMessage('Your profile has been updated.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your profile.')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitPassword(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')
    setError('')
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Password updated. Your other sessions have been signed out.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to change your password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`site-container ${styles.authPage}`}>
      <div className={styles.authCard}>
        <p className={styles.eyebrow}>Your account</p>
        <h1>Profile settings</h1>
        <p className={styles.intro}>{user.email}</p>
        {message && <p role="status">{message}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.form} onSubmit={submitProfile}>
          <label htmlFor="profile-name">Name
            <input id="profile-name" autoComplete="name" minLength="2" maxLength="100" required value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <Button type="submit" disabled={submitting}>Save profile</Button>
        </form>
        <h2 className={styles.passwordHeading}>Change password</h2>
        <form className={styles.form} onSubmit={submitPassword}>
          <label htmlFor="current-password">Current password
            <input id="current-password" type="password" autoComplete="current-password" minLength="12" maxLength="128" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label htmlFor="new-password">New password
            <input id="new-password" type="password" autoComplete="new-password" minLength="12" maxLength="128" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
          <Button type="submit" variant="secondary" disabled={submitting}>Update password</Button>
        </form>
      </div>
    </section>
  )
}

export default Profile
