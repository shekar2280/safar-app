import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_ROOT ?? "http://localhost:8000";

export const JWT_KEY = "safar_jwt_token";
export const USER_KEY = "safar_user";

import { SafarUser } from "../types";
import * as Sentry from "@sentry/react-native";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(JWT_KEY);
  const headers: Record<string, string> = { "ngrok-skip-browser-warning": "69420" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function syncUserWithBackend(firebaseIdToken: string): Promise<SafarUser> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/sync-user`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420"
    },
    body: JSON.stringify({ firebase_id_token: firebaseIdToken }),
  });

  if (!res.ok) {
    const errorDetails = await res.json().catch(() => ({}));
    const technicalError = errorDetails.detail ?? `Status: ${res.status}`;
    Sentry.captureException(new Error(`Sync Failed: ${technicalError}`));
    throw new Error("We're having trouble syncing your profile. Please check your connection and try again.");
  }

  const data = await res.json();
  await AsyncStorage.setItem(JWT_KEY, data.access_token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function getMe(): Promise<SafarUser | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/v1/auth/me`, { headers });
    if (!res.ok) {
      if (res.status !== 401) {
        const err = await res.json().catch(() => ({}));
        Sentry.captureMessage(`Profile fetch failed: ${res.status}`, {
          level: "warning",
          extra: { detail: err.detail }
        });
      }
      return null;
    }
    return await res.json();
  } catch (err) {
    Sentry.captureException(err);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove([JWT_KEY, USER_KEY]);
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (!err.detail) Sentry.captureException(new Error(`API Error (${endpoint}): ${res.status}`));
    throw new Error(err.detail ?? "Something went wrong on our end. Please try again in a moment.");
  }
  return res.json();
}

export async function apiGet<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const headers = await getAuthHeaders();
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (!err.detail) Sentry.captureException(new Error(`API Error (${endpoint}): ${res.status}`));
    throw new Error(err.detail ?? "Something went wrong on our end. Please try again in a moment.");
  }
  return res.json();
}

export async function apiPatch<T>(endpoint: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (!err.detail) Sentry.captureException(new Error(`API Error (${endpoint}): ${res.status}`));
    throw new Error(err.detail ?? "Something went wrong on our end. Please try again in a moment.");
  }
  return res.json();
}

export async function apiDelete(endpoint: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    Sentry.captureMessage(`API Error: ${err.detail ?? res.status}`);
    throw new Error("Something went wrong on our end. Please try again in a moment.");
  }
}

export async function updateUserProfile(data: { home_location?: any; full_name?: string }): Promise<any> {
  return await apiPatch("/api/v1/auth/me", data);
}
