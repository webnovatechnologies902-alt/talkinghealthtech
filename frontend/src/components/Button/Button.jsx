import { Link } from 'react-router-dom'
import styles from './Button.module.css'

function Button({ children, href, variant = 'primary', type = 'button', ...props }) {
  const className = `${styles.button} ${styles[variant] ?? styles.primary}`
  if (href) {
    if (href.startsWith('/')) {
      return <Link className={className} to={href} {...props}>{children}</Link>
    }
    return <a className={className} href={href} {...props}>{children}</a>
  }
  return <button className={className} type={type} {...props}>{children}</button>
}

export default Button
