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
  return Boolean(localStorage.getItem("access_token"));
}

/**
 * Login endpoint (POST /login/).
 * Expects { username, password }, stores returned tokens on success.
 */
export async function login({ username, password }) {
  const res = await axios.post(`${AUTH_URL}login/`, { username, password });
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
 * Expects { email }; returns 200 even if email doesn’t exist.
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

  console.log("Profile data:", res.data);
  if (!res.data) {
    throw new Error("Failed to fetch profile data");
  }
  return res.data;
}

/**
 * Update current user profile (PATCH /profile-update/).
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
