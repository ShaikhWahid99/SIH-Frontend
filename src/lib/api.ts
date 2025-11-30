import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function buildHeaders(opts: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ? (opts.headers as Record<string, string>) : {}),
  };

  // Only add JSON content-type when there's a body and no content-type provided
  if ((opts.body || (opts as any).json) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

// RAW FETCH
async function rawFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(API_BASE + path, {
    // credentials removed because we do not use cookies
    headers: buildHeaders(opts),
    ...opts,
  });

  const text = await res.text().catch(() => "");
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { res, data };
}

// MAIN REQUEST WRAPPER
async function request<T = any>(
  path: string,
  opts: RequestInit = {},
  retry = true
): Promise<T> {
  const { res, data } = await rawFetch(path, opts);

  // 401 = accessToken expired → try refresh once
  if (res.status === 401 && retry) {
    const refreshed = await refreshSession();

    if (refreshed) {
      // retry original request once
      return request<T>(path, opts, false);
    } else {
      clearTokens();
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const message =
      data?.message || (typeof data === "string" ? data : res.statusText);
    const err: any = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

// REFRESH SESSION (safe)
async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { res, data } = await rawFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: { "Content-Type": "application/json" }, // make sure server sees JSON
    });

    if (!res.ok) return false;

    // backend should return { accessToken, refreshToken }
    if (data && data.accessToken && data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch (e) {
    console.error("refreshSession error:", e);
    return false;
  }
}

export const api = {
  // auth
  register: (body: any) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    // send refreshToken in body so backend can clear it
    request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    }),

  refresh: () =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    }),

  // user
  getMe: () => request("/api/me"),

  postMe: (body: any) =>
    request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  // quiz
  submitQuiz: (body: any) =>
    request("/quiz", { method: "POST", body: JSON.stringify(body) }),

  // google oauth start url
  startGoogle: () => `${API_BASE}/auth/google`,
};
