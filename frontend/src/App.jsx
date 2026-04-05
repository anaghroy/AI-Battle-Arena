import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SearchPage from './pages/SearchPage'
import useAuthStore from './store/authStore'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-regular)' }}>Loading Arena...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Protected Dashboard Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="search" element={<SearchPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={
        useAuthStore.getState().isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        useAuthStore.getState().isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
      } />
      <Route path="/verify" element={<VerifyEmailPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App