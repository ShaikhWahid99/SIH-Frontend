import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "./auth";

import {
  getTrainerAccessToken,
  getTrainerRefreshToken,
  saveTrainerTokens,
  clearTrainerTokens,
} from "./auth";




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

// ---------------------------------------------------------
// LEARNER HEADER BUILDER
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// TRAINER HEADER BUILDER
// ---------------------------------------------------------
function buildTrainerHeaders(opts: RequestInit = {}) {
  const token = getTrainerAccessToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers ? (opts.headers as Record<string, string>) : {}),
  };

  if ((opts.body || (opts as any).json) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

// ---------------------------------------------------------
// RAW FETCH
// ---------------------------------------------------------
async function rawFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(API_BASE + path, {
    headers: buildHeaders(opts),
    ...opts,
  });

  let text = "";
  try {
    text = await res.text();
  } catch {}

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { res, data };
}

// ---------------------------------------------------------
// LEARNER REQUEST WRAPPER
// ---------------------------------------------------------
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

  if (!res.ok) throw new Error(data?.message || "Request failed");

  return data;
}

// ---------------------------------------------------------
// LEARNER TOKEN REFRESH
// ---------------------------------------------------------
async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(API_BASE + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      // headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) return false;
    if (data.accessToken && data.refreshToken) {
      saveTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch {
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

// ---------------------------------------------------------
// TRAINER REQUEST WRAPPER
// ---------------------------------------------------------
async function trainerRequest<T = any>(
  path: string,
  opts: RequestInit = {},
  retry = true
): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: buildTrainerHeaders(opts),
    ...opts,
  });

  let text = "";
  try {
    text = await res.text();
  } catch {}

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (res.status === 401 && retry) {
    const ok = await trainerRefreshSession();
    if (ok) return trainerRequest<T>(path, opts, false);

    clearTrainerTokens();
    throw new Error("Trainer session expired");
  }

  if (!res.ok) throw new Error(data?.message || "Trainer API error");

  return data;
}

// ---------------------------------------------------------
// TRAINER TOKEN REFRESH
// ---------------------------------------------------------
async function trainerRefreshSession() {
  const refreshToken = getTrainerRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(API_BASE + "/trainer/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok) return false;
    if (data.accessToken && data.refreshToken) {
      saveTrainerTokens(data.accessToken, data.refreshToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------
// EXPORTED API
// ---------------------------------------------------------
export const api = {
  // ─────────── learner auth ───────────
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
    request("/api/me", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // ─────────── trainer auth ───────────
  trainerLogin: (body: any) =>
    trainerRequest("/trainer/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  trainerGetMe: () => trainerRequest("/trainer/me"),

  trainerGetLearners: () => trainerRequest("/trainer/learners"),

  trainerRefreshSession: () =>
    trainerRequest("/trainer/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getTrainerRefreshToken() }),
    }),

  trainerLogout: () =>
    trainerRequest("/trainer/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getTrainerRefreshToken() }),
    }),

  // ─────────── static quiz ───────────
  submitQuiz: (body: any) =>
    request("/quiz", {
      method: "POST",
      body: JSON.stringify(body),
    }),

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

  // ✅ NEW: Skill India Recommendations 
  getSkillIndiaCourses: (id: string) => request<any[]>(`/api/recommendations/skill-india/${id}`),

  searchVideos: (query: string) => request<YouTubeVideo[]>(`/api/videos/search?q=${encodeURIComponent(query)}`),

  getAllSkillIndiaCourses: (page = 1, limit = 20, search = '') => 
    request<any[]>(`/api/skill-india/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  // ─────────── chatbot ───────────
  sendChat: (query: string, threadId?: string) =>
    request<{ thread_id: string; data: any }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ query, thread_id: threadId }),
    }),
};
