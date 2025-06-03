import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/auth";

export default function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}
