import AuthSwitcher from '../components/AuthSwitcher';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import ForgotPassword from '../pages/ForgotPassword';
import PasswordReset from '../pages/PasswordReset';
import PrivateRoute from './PrivateRoute';
import { Navigate } from 'react-router-dom';

export const routes = [
  { path: '/login', element: <AuthSwitcher /> },
  { path: '/register', element: <AuthSwitcher /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/password-reset-confirm/:uid/:token', element: <PasswordReset /> },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  { path: '/', element: <Home /> },
  { path: '*', element: <Navigate to="/" replace /> },
];
