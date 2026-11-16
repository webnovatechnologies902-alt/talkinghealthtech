import styles from '../Page.module.css'

const values = [
  { icon: 'bi-people', title: 'People before platforms', text: 'We look at technology through the experiences of patients, clinicians and the communities around them.' },
  { icon: 'bi-chat-heart', title: 'Curiosity with care', text: 'We make space for useful questions, diverse perspectives and thoughtful debate.' },
  { icon: 'bi-arrow-repeat', title: 'Progress worth sharing', text: 'We spotlight the ideas and collaborations helping healthcare learn and improve.' },
]

function About() {
  return (
    <>
      <header className={styles.pageHero}><div className="site-container"><p className={styles.eyebrow}>About us</p><h1>Health technology is a people story.</h1><p>Talking HealthTech brings the health technology community together through independent stories, honest conversations and fresh perspectives.</p></div></header>
      <section className={`site-container ${styles.pageContent}`}>
        <div className={styles.narrowContent}>
          <p className={styles.contentLead}>We believe a healthier future is built when good ideas can travel, people can learn from one another and technology serves the needs of care.</p>
          <p>Our platform shares original editorial content and conversations from across the healthtech landscape. We explore digital health, emerging technology, startups and the everyday work of making healthcare more connected and human.</p>
        </div>
        <div className={styles.featureGrid}>{values.map((value) => <article className={styles.featureCard} key={value.title}><i className={`bi ${value.icon}`} aria-hidden="true" /><h2>{value.title}</h2><p>{value.text}</p></article>)}</div>
      </section>
    </>
  )
}

export default About
