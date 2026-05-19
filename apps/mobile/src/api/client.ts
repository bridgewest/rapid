import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "rapid_access_token";
const ONBOARDING_KEY = "rapid_onboarding_complete";

export async function isOnboardingComplete(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === "1";
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  if (done) await AsyncStorage.setItem(ONBOARDING_KEY, "1");
  else await AsyncStorage.removeItem(ONBOARDING_KEY);
}

export function getApiUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
  return extra?.apiUrl ?? "http://127.0.0.1:4000";
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (token == null) await AsyncStorage.removeItem(TOKEN_KEY);
  else await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function apiFetch(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<Response> {
  const url = `${getApiUrl()}${path}`;
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const token = init?.token ?? (await getStoredToken());
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}
