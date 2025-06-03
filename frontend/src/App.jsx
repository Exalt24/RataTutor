import { Navigate, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AuthSwitcher from './components/AuthSwitcher'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import PasswordReset from './pages/PasswordReset'
import { isLoggedIn } from './services/auth'
import LoadingSpinner from './components/LoadingSpinner'

function PrivateRoute({ children }) {
  return isLoggedIn()
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={<AuthSwitcher />} />
      <Route path="/register" element={<AuthSwitcher />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/password-reset-confirm/:uid/:token"
        element={<PasswordReset />}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
