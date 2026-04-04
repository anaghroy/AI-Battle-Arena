import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import useAuthStore from './store/authStore'

const App = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <div>Home Dashboard (Protected)</div> : <Navigate to="/login" replace />} 
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
    </Routes>
  )
}

export default App