import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import styles from './Navbar.module.css'

const links = [
  { label: 'Home', to: '/' },
  { label: 'News', to: '/articles' },
  { label: 'Podcasts', to: '/podcasts' },
  { label: 'Companies', to: '/directory' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Glossary', to: '/glossary' },
  { label: 'Events', to: '/events' },
  { label: 'Community', to: '/community' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const [logoutError, setLogoutError] = useState('')

  function submitSearch(event) {
    event.preventDefault()
    const search = query.trim()
    if (search) {
      navigate(`/articles?search=${encodeURIComponent(search)}`)
      setSearchOpen(false)
      setMenuOpen(false)
      setQuery('')
    }
  }

  async function handleSignOut() {
    setLogoutError('')
    try {
      await signOut(() => navigate('/login'))
      setMenuOpen(false)
    } catch (error) {
      setLogoutError(error.message || 'Unable to sign out. Please try again.')
    }
  }

  return (
    <header className={styles.header}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className={styles.inner}>
        <Link className={styles.brand} to="/" aria-label="Talking HealthTech home" onClick={() => setMenuOpen(false)}>
          <span className={styles.brandMark} aria-hidden="true"><i className="bi bi-heart-pulse-fill" /></span>
          <span className={styles.brandWords}>talking<span>healthtech</span></span>
        </Link>
        <button
          className={styles.menuToggle}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
        </button>
        <nav className={`${styles.navigation} ${menuOpen ? styles.open : ''}`} aria-label="Main navigation">
          <div className={styles.links}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              className={styles.searchToggle}
              type="button"
              aria-label={searchOpen ? 'Close search' : 'Search articles'}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <i className={`bi ${searchOpen ? 'bi-x-lg' : 'bi-search'}`} aria-hidden="true" />
            </button>
            {!authLoading && user && (
              <>
                {user.role === 'admin' && <Link className={styles.accountLink} to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
                <Link className={styles.accountLink} to="/profile" onClick={() => setMenuOpen(false)}>Account</Link>
                <button className={styles.accountButton} type="button" onClick={handleSignOut}>Sign out</button>
              </>
            )}
            {!authLoading && !user && <Link className={styles.accountLink} to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>}
            <Link className={styles.subscribe} to="/newsletter" onClick={() => setMenuOpen(false)}>Subscribe</Link>
          </div>
          {logoutError && <p className={styles.logoutError} role="alert">{logoutError}</p>}
          {searchOpen && (
            <form className={styles.searchForm} role="search" onSubmit={submitSearch}>
              <label className="visually-hidden" htmlFor="site-search">Search stories</label>
              <input id="site-search" type="search" placeholder="Search stories..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" aria-label="Submit search"><i className="bi bi-arrow-right" aria-hidden="true" /></button>
            </form>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
