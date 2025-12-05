import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// external LLM quiz service (Python API)
const CAREER_QUIZ_BASE = "https://career-quiz-api.onrender.com";

/**
 * Shape of the Python API response
 */
export interface DynamicQuizApiResponse {
  status: string;
  user_id: string;
  data: {
    quiz_title: string;
    questions: {
      id: number;
      question_text: string;
      options: string[];
    }[];
  };
}

/**
 * Normalized question type that your React components will use
 */
export interface DynamicQuizQuestion {
  id: string;       // string for easier map keys in state
  question: string;
  options: string[];
}

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

// RAW FETCH to your Node backend
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

// MAIN REQUEST WRAPPER (for your Node backend)
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

/**
 * Call the external Python LLM API to generate 10 dynamic quiz questions
 * This DOES NOT go through your Node backend; it hits Render directly.
 */
async function fetchDynamicQuiz(userId: string): Promise<DynamicQuizQuestion[]> {
  const res = await fetch(`${CAREER_QUIZ_BASE}/api/generate-quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Career quiz API error: ${res.status} ${text}`);
  }

  const json: DynamicQuizApiResponse = await res.json();

  // Map the Python structure → frontend-friendly structure
  return json.data.questions.map((q) => ({
    id: String(q.id),
    question: q.question_text,
    options: q.options,
  }));
}

export const api = {
  // ─────────── auth ───────────
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

  // ─────────── user ───────────
  getMe: () => request("/api/me"),

  postMe: (body: any) =>
    request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  // ─────────── static quiz (existing) ───────────
  submitQuiz: (body: any) =>
    request("/quiz", { method: "POST", body: JSON.stringify(body) }),

  // ─────────── dynamic LLM quiz (NEW) ───────────

  /**
   * Get 10 dynamic questions from Python API, based on user_id stored in DB
   */
  getDynamicQuiz: (userId: string) => fetchDynamicQuiz(userId),

  /**
   * Save dynamic quiz questions + answers to your own backend (/api/me)
   * You’ll call this with something like:
   *   api.saveDynamicQuiz({ dynamicQuizAnswers, dynamicQuizCompleted: true, dynamicQuizCompletedAt: ... })
   */
  saveDynamicQuiz: (body: any) =>
    request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  // google oauth start url
  startGoogle: () => `${API_BASE}/auth/google`,

  // ─────────── recommendations (Neo4j) ───────────
  getRecommendations: () => request<{ items: any[] }>("/api/recommendations"),
};
