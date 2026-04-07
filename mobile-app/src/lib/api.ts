import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace("/api/generate", "") ?? "http://localhost:8000";

export const JWT_KEY = "safar_jwt_token";
export const USER_KEY = "safar_user";

export interface SafarUser {
  id: number;
  firebase_uid: string;
  email: string | null;
  full_name: string | null;
  photo_url: string | null;
  created_at: string;
  last_login: string | null;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem(JWT_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function syncUserWithBackend(firebaseIdToken: string): Promise<SafarUser> {
  const res = await fetch(`${BASE_URL}/api/auth/sync-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firebase_id_token: firebaseIdToken }),
  });

  if (!res.ok) {
    throw new Error(`Failed to sync user: ${res.status}`);
  }

  const data = await res.json();
  await AsyncStorage.setItem(JWT_KEY, data.access_token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function getMe(): Promise<SafarUser | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_URL}/api/auth/me`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
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
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
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
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
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
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
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
    throw new Error(err.detail ?? `Request failed: ${res.status}`);
  }
}

export async function updateUserProfile(data: { home_location?: any; full_name?: string }): Promise<any> {
  return await apiPatch("/api/auth/me", data);
}
