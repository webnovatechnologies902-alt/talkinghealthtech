import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import {
  changePassword as changePasswordRequest,
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
} from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let controller
    const handleExpiredSession = () => {
      setUser(null)
      setError('Your session has expired. Please sign in again.')
    }

    window.addEventListener('auth:session-expired', handleExpiredSession)
    const timer = setTimeout(() => {
      controller = new AbortController()
      getCurrentUser({ signal: controller.signal })
        .then(setUser)
        .catch((requestError) => {
          if (!controller.signal.aborted && requestError.response?.status !== 401) {
            setError(requestError.message || 'Unable to restore your session.')
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 0)

    return () => {
      clearTimeout(timer)
      controller?.abort()
      window.removeEventListener('auth:session-expired', handleExpiredSession)
    }
  }, [])

  const signIn = useCallback(async (credentials) => {
    setError('')
    const nextUser = await loginRequest(credentials)
    setUser(nextUser)
    return nextUser
  }, [])

  const signUp = useCallback(async (details) => {
    setError('')
    const nextUser = await registerRequest(details)
    setUser(nextUser)
    return nextUser
  }, [])

  const signOut = useCallback(async (onSuccess) => {
    setError('')
    await logoutRequest()
    onSuccess?.()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (profile) => {
    const nextUser = await updateProfileRequest(profile)
    setUser(nextUser)
    return nextUser
  }, [])

  const changePassword = useCallback(async (passwords) => {
    const nextUser = await changePasswordRequest(passwords)
    setUser(nextUser)
    return nextUser
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
  }), [user, loading, error, signIn, signUp, signOut, updateProfile, changePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
