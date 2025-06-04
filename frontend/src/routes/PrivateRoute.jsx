import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/authService";

export default function PrivateRoute({ children }) {
  const loggedIn = isLoggedIn();  // Check if user is logged in

  // If the user is logged in, allow access to the children route
  if (loggedIn) {
    return children;
  }

  // If not logged in, redirect to login page
  return <Navigate to="/login" replace />;
}
