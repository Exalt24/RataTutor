import axios from "axios";
import { API_URL, AUTH_URL } from "../config";
import { refreshToken, clearTokens } from "./authService";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach access token to requests
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    cfg.headers["Authorization"] = `Bearer ${token}`;
  }
  return cfg;
});

// Response Interceptor: Handle 401 Unauthorized errors (Token Expiration)
api.interceptors.response.use(
  (res) => res, // Return the response if no error
  async (err) => {
    const original = err.config;
    // If a 401 Unauthorized error occurs (access token expired)
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // Attempt to refresh the access token using the refresh token
        const newTokens = await refreshToken();
        saveTokens(newTokens); // Save the new access and refresh tokens to localStorage

        // Retry the original request with the new access token
        original.headers["Authorization"] = `Bearer ${newTokens.access}`;
        return api(original); // Retry the request with the new token
      } catch (refreshError) {
        // If refreshing the token fails, clear all tokens and redirect to login
        clearTokens();
        window.location.href = AUTH_URL + "login/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err); // Reject if it's not a 401 error
  }
);

export default api;
