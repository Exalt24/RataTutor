// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Home     from './pages/Home'
import Login    from './pages/Login'
import Register    from './pages/Register'
import Dashboard from './pages/Dashboard'
import { isLoggedIn } from './services/authService'

function PrivateRoute({ children }) {
  return isLoggedIn()
    ? children
    : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Home />} />
      {/* catch‐all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
