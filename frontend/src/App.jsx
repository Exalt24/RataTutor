import { Navigate, Route, Routes } from 'react-router-dom'
import AuthSwitcher from './components/AuthSwitcher'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
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
