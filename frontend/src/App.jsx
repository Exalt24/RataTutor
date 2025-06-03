import { Navigate, Route, Routes } from 'react-router-dom'
import AuthSwitcher from './components/AuthSwitcher'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import PasswordReset from './pages/PasswordReset'
import { isLoggedIn } from './services/auth'

function PrivateRoute({ children }) {
  return isLoggedIn()
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
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
