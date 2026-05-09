import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  const isAdmin = localStorage.getItem('admin_session') === 'active'
  const authToken = localStorage.getItem('admin_auth_token')

  // Validate both session and auth token for security
  if (!isAdmin || !authToken) {
    return <Navigate to='/admin/login' replace state={{ from: location }} />
  }

  return children
}
