import axios from "axios";
import { AUTH_URL } from "../config";

/**
 * Save both access and refresh tokens into localStorage.
 */
export function saveTokens({ access, refresh }) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

/**
 * Remove both tokens from localStorage.
 */
export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

/**
 * Returns true if an access token exists in localStorage.
 */
export function isLoggedIn() {
  const token = localStorage.getItem("access_token");

  if (!token) return false; // No token means the user is not logged in

  try {
    const decoded = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token to access the payload

    // Check if the token has expired
    const currentTime = Date.now() / 1000; // Get the current time in seconds (JWT expiration is in seconds)

    if (decoded.exp < currentTime) {
      // Token has expired, clear both tokens from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }

    return true; // Token is still valid
  } catch (error) {
    // Token is malformed, clear tokens
    clearTokens();
    return false;
  }
}

/**
 * Login endpoint (POST /token/) - CHANGED TO USE JWT TOKEN ENDPOINT
 * Expects { username, password }, stores returned tokens on success.
 */
export async function login({ username, password }) {
  const res = await axios.post(`${AUTH_URL}token/`, { username, password });
  saveTokens(res.data);
  return res.data;
}

/**
 * Register endpoint (POST /register/).
 * Expects { username, email, password, confirm_password }.
 */
export async function register({
  username,
  email,
  password,
  confirm_password,
}) {
  const res = await axios.post(`${AUTH_URL}register/`, {
    username,
    email,
    password,
    confirm_password,
  });
  return res.data;
}

/**
 * Logout endpoint (POST /logout/).
 * Sends current refresh token in the body and Authorization: Bearer <access>.
 * Regardless of success/failure, clears tokens locally.
 */
export async function logout() {
  const refresh = localStorage.getItem("refresh_token");
  const access = localStorage.getItem("access_token");

  try {
    await axios.post(
      `${AUTH_URL}logout/`,
      { refresh },
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    // ignore any error
  } finally {
    clearTokens();
  }
}

/**
 * Refresh endpoint (POST /refresh/).
 * Sends { refresh } and expects new { access, refresh }.
 */
export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token available");
  const res = await axios.post(`${AUTH_URL}refresh/`, { refresh });
  saveTokens(res.data);
  return res.data.access;
}

/**
 * Request password-reset (POST /password-reset/).
 * Expects { email }; returns 200 even if email doesn't exist.
 */
export async function requestPasswordReset({ email }) {
  const res = await axios.post(`${AUTH_URL}password-reset/`, { email });
  return res.data;
}

/**
 * Confirm password-reset (POST /password-reset-confirm/).
 * Expects { uid, token, new_password, confirm_password }.
 */
export async function confirmPasswordReset({
  uid,
  token,
  new_password,
  confirm_password,
}) {
  const res = await axios.post(`${AUTH_URL}password-reset-confirm/`, {
    uid,
    token,
    new_password,
    confirm_password,
  });
  return res.data;
}

/**
 * Get current user profile (GET /profile/).
 * Sends Authorization: Bearer <access> in headers.
 */
export async function getProfile() {
  const access = localStorage.getItem("access_token");

  const res = await axios.get(`${AUTH_URL}profile/`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (!res.data) {
    throw new Error("Failed to fetch profile data");
  }
  return res.data;
}

/**
 * Update current user profile (POST /profile-update/).
 * Sends Authorization: Bearer <access> in headers.
 * Payload: { username, email, full_name, bio, avatar }
 */
export async function updateProfile({
  username,
  email,
  full_name,
  bio,
  avatar,
}) {
  const access = localStorage.getItem("access_token");

  const res = await axios.post(
    `${AUTH_URL}profile-update/`,
    {
      username,
      email,
      full_name,
      bio,
      avatar,
    },
    {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

/**
 * Record study activity for streak tracking (POST /record-activity/).
 * Call this when user completes meaningful study activities.
 * Sends Authorization: Bearer <access> in headers.
 */
export async function recordActivity() {
  const access = localStorage.getItem("access_token");

  const res = await axios.post(
    `${AUTH_URL}record-activity/`,
    {}, // Empty body
    {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

/**
 * Get current streak status (GET /streak-status/).
 * Sends Authorization: Bearer <access> in headers.
 */
export async function getStreakStatus() {
  const access = localStorage.getItem("access_token");

  const res = await axios.get(`${AUTH_URL}streak-status/`, {
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  return res.data;
}

/**
 * Helper function to automatically track study activities.
 * Call this after meaningful user actions like completing quizzes,
 * generating flashcards, creating materials, etc.
 * Returns the updated streak data or null if tracking failed.
 */
export async function trackStudyActivity() {
  try {
    if (!isLoggedIn()) {
      return null;
    }

    const result = await recordActivity();
    
    if (result.streak_updated) {
      console.log("Streak updated:", result.streak);
    }
    
    return result;
  } catch (error) {
    console.error("Failed to track study activity:", error);
    return null;
  }
}