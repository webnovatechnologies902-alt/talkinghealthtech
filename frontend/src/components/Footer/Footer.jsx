import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`site-container ${styles.main}`}>
        <div className={styles.brandColumn}>
          <Link className={styles.brand} to="/">
            <span className={styles.brandMark}><i className="bi bi-heart-pulse-fill" aria-hidden="true" /></span>
            <span>talking<span>healthtech</span></span>
          </Link>
          <p>Stories, ideas and conversations for the people moving healthcare forward.</p>
          <div className={styles.socials} aria-label="Social media">
            <a href="https://www.linkedin.com/" aria-label="LinkedIn"><i className="bi bi-linkedin" aria-hidden="true" /></a>
            <a href="https://www.instagram.com/" aria-label="Instagram"><i className="bi bi-instagram" aria-hidden="true" /></a>
            <a href="https://www.youtube.com/" aria-label="YouTube"><i className="bi bi-youtube" aria-hidden="true" /></a>
          </div>
        </div>
        <div className={styles.footerLinks}>
          <h2>Explore</h2>
          <Link to="/articles">Latest news</Link>
          <Link to="/podcasts">Podcasts</Link>
          <Link to="/directory">Company directory</Link>
          <Link to="/jobs">HealthTech jobs</Link>
          <Link to="/glossary">HealthTech glossary</Link>
          <Link to="/events">Events</Link>
        </div>
        <div className={styles.footerLinks}>
          <h2>Talking HealthTech</h2>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/newsletter">The weekly briefing</Link>
          <a href="https://go.talkinghealthtech.com/thtplus/" target="_blank" rel="noreferrer">Community</a>
          <a href="mailto:hello@talkinghealthtech.com">Partner with us</a>
        </div>
        <div className={styles.footerNote}>
          <span className={styles.noteIcon}><i className="bi bi-envelope-paper" aria-hidden="true" /></span>
          <h2>Good healthtech reads.</h2>
          <p>Thoughtful stories, delivered to your inbox.</p>
          <Link to="/newsletter">Get the newsletter <i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={`site-container ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} Talking HealthTech. All rights reserved.</span>
          <span>Independent perspectives for a healthier future.</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
