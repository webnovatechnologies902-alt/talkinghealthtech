import styles from './SectionHeading.module.css'

function SectionHeading({ eyebrow, title, description, align = 'left', action }) {
  return (
    <div className={`${styles.heading} ${styles[align] ?? ''}`}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}

export default SectionHeading
