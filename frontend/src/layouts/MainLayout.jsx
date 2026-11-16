import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import usePageMetadata from '../hooks/usePageMetadata'

function MainLayout() {
  const location = useLocation()
  const titles = {
    '/': 'Talking HealthTech — Ideas shaping the future of health',
    '/articles': 'HealthTech News & Insights | Talking HealthTech',
    '/news': 'HealthTech News & Insights | Talking HealthTech',
    '/podcasts': 'HealthTech Podcasts | Talking HealthTech',
    '/podcast': 'HealthTech Podcasts | Talking HealthTech',
    '/directory': 'HealthTech Company Directory | Talking HealthTech',
    '/jobs': 'HealthTech Jobs | Talking HealthTech',
    '/community': 'Talking HealthTech Community',
    '/newsletter': 'Newsletter | Talking HealthTech',
    '/unsubscribe': 'Newsletter preferences | Talking HealthTech',
    '/glossary': 'HealthTech Glossary | Talking HealthTech',
    '/events': 'HealthTech Events | Talking HealthTech',
    '/about': 'About Talking HealthTech',
    '/contact': 'Contact Talking HealthTech',
    '/login': 'Sign in | Talking HealthTech',
    '/register': 'Create an account | Talking HealthTech',
    '/profile': 'Your account | Talking HealthTech',
    '/admin': 'Administration | Talking HealthTech',
  }
  const title = titles[location.pathname]
    ?? (location.pathname.startsWith('/articles/') || location.pathname.startsWith('/news/')
      ? 'HealthTech Stories | Talking HealthTech'
      : location.pathname.startsWith('/podcast') ? 'HealthTech Podcasts | Talking HealthTech'
        : location.pathname.startsWith('/directory/') ? 'Company Profile | Talking HealthTech'
          : location.pathname.startsWith('/jobs/') ? 'HealthTech Job | Talking HealthTech'
            : 'Talking HealthTech')
  const description = location.pathname === '/'
    ? 'The latest news, ideas and conversations shaping the future of health technology.'
    : `${title} — stories, ideas and conversations shaping a healthier future.`
  usePageMetadata(title, description)

  return (
    <>
      <Navbar />
      <main id="main-content"><Outlet /></main>
      <Footer />
    </>
  )
}

export default MainLayout
