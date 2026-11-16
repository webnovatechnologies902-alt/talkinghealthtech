import Button from '../../components/Button/Button'
import styles from '../Companies/Directory.module.css'

function Community() {
  return (
    <>
      <header className={styles.hero}><div className="site-container"><p className={styles.eyebrow}>THT+ Community</p><h1>Connect with the people moving healthtech forward.</h1><p>Meet peers across healthcare and technology, share ideas, and learn from the wider digital health ecosystem.</p></div></header>
      <section className={`site-container ${styles.listing}`}>
        <div className={styles.grid}>
          <article className={styles.card}>
            <p className={styles.eyebrow}>For individuals and teams</p>
            <h2>Join THT+</h2>
            <p>Explore membership, events, and ways to connect with the Talking HealthTech community.</p>
            <a className={styles.cardLink} href="https://go.talkinghealthtech.com/thtplus/" target="_blank" rel="noreferrer">Explore THT+ membership <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a>
          </article>
          <article className={styles.card}>
            <p className={styles.eyebrow}>Community platform</p>
            <h2>Meet the community</h2>
            <p>Continue to the community space to connect with health technology professionals.</p>
            <a className={styles.cardLink} href="https://community.talkinghealthtech.com/" target="_blank" rel="noreferrer">Open the community <i className="bi bi-box-arrow-up-right" aria-hidden="true" /></a>
          </article>
        </div>
        <div className={styles.actions}><Button href="/events" variant="secondary">Explore upcoming events</Button></div>
      </section>
    </>
  )
}

export default Community
