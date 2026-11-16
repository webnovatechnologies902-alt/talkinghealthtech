import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="site-container route-loading" role="status">Checking your session…</div>
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && user.role !== 'admin') {
    return (
      <section className="site-container route-not-found" role="alert">
        <h1>Administrator access required</h1>
        <p>Your account does not have permission to view this page.</p>
      </section>
    )
  }
  return children
}

export default ProtectedRoute
