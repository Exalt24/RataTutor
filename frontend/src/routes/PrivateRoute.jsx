import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/authService";

export default function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
