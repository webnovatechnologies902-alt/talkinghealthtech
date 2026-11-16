import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import useAuth from '../../hooks/useAuth'
import styles from './Auth.module.css'

function Auth({ mode }) {
  const isRegister = mode === 'register'
  const { user, signIn, signUp, loading: authLoading, error: authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && user) return <Navigate to={location.state?.from?.pathname || '/profile'} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (isRegister) await signUp(form)
      else await signIn({ email: form.email, password: form.password })
      navigate(location.state?.from?.pathname || '/profile', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete your request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={`site-container ${styles.authPage}`}>
      <div className={styles.authCard}>
        <p className={styles.eyebrow}>{isRegister ? 'Join the conversation' : 'Welcome back'}</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in to your account'}</h1>
        <p className={styles.intro}>Your healthtech stories and conversations, all in one place.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          {isRegister && (
            <label htmlFor="auth-name">Name
              <input id="auth-name" name="name" autoComplete="name" minLength="2" maxLength="100" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          )}
          <label htmlFor="auth-email">Email address
            <input id="auth-email" name="email" type="email" autoComplete="email" maxLength="254" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label htmlFor="auth-password">Password
            <input id="auth-password" name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 12 : 1} maxLength="128" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {(error || authError) && <p className={styles.error} role="alert">{error || authError}</p>}
          <Button type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</Button>
        </form>
        <p className={styles.switchMode}>
          {isRegister ? 'Already have an account?' : 'New to Talking HealthTech?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
        </p>
      </div>
    </section>
  )
}

export default Auth
