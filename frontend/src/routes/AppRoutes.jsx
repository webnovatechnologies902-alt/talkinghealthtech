import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from './ProtectedRoute'

const Home = lazy(() => import('../pages/Home/Home'))
const Articles = lazy(() => import('../pages/Articles/Articles'))
const Podcasts = lazy(() => import('../pages/Podcasts/Podcasts'))
const Glossary = lazy(() => import('../pages/Glossary/Glossary'))
const Events = lazy(() => import('../pages/Events/Events'))
const Companies = lazy(() => import('../pages/Companies/Companies'))
const Jobs = lazy(() => import('../pages/Jobs/Jobs'))
const Community = lazy(() => import('../pages/Community/Community'))
const About = lazy(() => import('../pages/About/About'))
const Contact = lazy(() => import('../pages/Contact/Contact'))
const Auth = lazy(() => import('../pages/Auth/Auth'))
const Profile = lazy(() => import('../pages/Profile/Profile'))
const Admin = lazy(() => import('../pages/Admin/Admin'))
const Newsletter = lazy(() => import('../pages/Newsletter/Newsletter'))
const Unsubscribe = lazy(() => import('../pages/Newsletter/Unsubscribe'))

function LoadingPage() {
  return <div className="site-container route-loading" role="status" aria-live="polite">Loading page…</div>
}

function NotFound() {
  return <section className="site-container route-not-found"><h1>Page not found</h1><p>We couldn’t find that page. It may have moved.</p><a href="/">Return home</a></section>
}

function AppRoutes() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<Articles />} />
            <Route path="news" element={<Articles />} />
            <Route path="news/:slug" element={<Articles />} />
            <Route path="podcasts" element={<Podcasts />} />
            <Route path="podcasts/:slug" element={<Podcasts />} />
            <Route path="podcast" element={<Podcasts />} />
            <Route path="podcast/:slug" element={<Podcasts />} />
            <Route path="directory" element={<Companies />} />
            <Route path="directory/:slug" element={<Companies />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:slug" element={<Jobs />} />
            <Route path="community" element={<Community />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="glossary/:slug" element={<Glossary />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:slug" element={<Events />} />
            <Route path="login" element={<Auth mode="login" />} />
            <Route path="register" element={<Auth mode="register" />} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="unsubscribe" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRoutes
