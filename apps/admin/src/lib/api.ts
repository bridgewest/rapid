const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  return localStorage.getItem("dukorpay_admin_token");
}

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  const t = getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  return fetch(`${API}${path}`, { ...init, headers });
}
