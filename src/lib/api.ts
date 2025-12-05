import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// external LLM quiz service (Python API)
const CAREER_QUIZ_BASE = "https://career-quiz-api.onrender.com";

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

export interface DynamicQuizQuestion {
  id: string;       
  question: string;
  options: string[];
}

function buildHeaders(opts: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ? (opts.headers as Record<string, string>) : {}),
  };

  if ((opts.body || (opts as any).json) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function rawFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(API_BASE + path, {
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

async function request<T = any>(
  path: string,
  opts: RequestInit = {},
  retry = true
): Promise<T> {
  const { res, data } = await rawFetch(path, opts);

  if (res.status === 401 && retry) {
    const refreshed = await refreshSession();
    if (refreshed) {
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

async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const { res, data } = await rawFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return false;

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

  return json.data.questions.map((q) => ({
    id: String(q.id),
    question: q.question_text,
    options: q.options,
  }));
}

export interface YouTubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  videoId: string;
  views: string;
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

  // ─────────── static quiz ───────────
  submitQuiz: (body: any) =>
    request("/quiz", { method: "POST", body: JSON.stringify(body) }),

  // ─────────── dynamic LLM quiz ───────────
  getDynamicQuiz: (userId: string) => fetchDynamicQuiz(userId),

  saveDynamicQuiz: (body: any) =>
    request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  startGoogle: () => `${API_BASE}/auth/google`,

  // ─────────── recommendations (Neo4j) ───────────
  getRecommendations: () => request<{ items: any[] }>("/api/recommendations"),

  // Get single pathway details
  getPathwayById: (id: string) => request<any>(`/api/pathways/${id}`),

  // NEW: Get Graph Data
  getPathwayGraph: (id: string) => request<{ nodes: any[]; links: any[] }>(`/api/pathways/${id}/graph`),

  getCourseById: (id: string) => request<any>(`/api/courses/${id}`), 

  searchVideos: (query: string) => request<YouTubeVideo[]>(`/api/videos/search?q=${encodeURIComponent(query)}`),
};