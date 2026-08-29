const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("fincontrol_token");
  }
  return null;
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fincontrol_token", token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fincontrol_token");
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackSupplier?: () => T
): Promise<T> {
  const token = getStoredToken();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        console.warn(`[${requestId}] Unauthorized API response for ${endpoint}`);
      }
      if (fallbackSupplier) {
        return fallbackSupplier();
      }
      const errBody = await res.text();
      throw new Error(`API Error ${res.status}: ${errBody}`);
    }

    return await res.json();
  } catch (err) {
    if (fallbackSupplier) {
      return fallbackSupplier();
    }
    throw err;
  }
}
