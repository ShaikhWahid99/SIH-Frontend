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

// --- INTERFACES ---
export interface DynamicQuizQuestion {
  id: string | number;
  question: string;
  options: string[];
}

export interface YouTubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  videoId: string;
  views: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  apply_link: string;
  description: string;
}

// --- HEADERS & FETCH HELPERS ---
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

async function refreshSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(API_BASE + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
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

// --- TRAINER HELPERS ---
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
  try { text = await res.text(); } catch {}
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (res.status === 401 && retry) {
    const ok = await trainerRefreshSession();
    if (ok) return trainerRequest<T>(path, opts, false);
    clearTrainerTokens();
    throw new Error("Trainer session expired");
  }

  if (!res.ok) throw new Error(data?.message || "Trainer API error");
  return data;
}

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
  } catch { return false; }
}

// --- EXPORTED API OBJECT ---
export const api = {
  // Auth
  register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (email: string, password: string) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: getRefreshToken() }) }),
  refresh: () => request("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken: getRefreshToken() }) }),

  // User
  getMe: () => request("/api/me"),
  postMe: (body: any) => request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  // Trainer
  trainerLogin: (body: any) => trainerRequest("/trainer/login", { method: "POST", body: JSON.stringify(body) }),
  trainerGetMe: () => trainerRequest("/trainer/me"),
  trainerRefreshSession: () => trainerRequest("/trainer/refresh", { method: "POST", body: JSON.stringify({ refreshToken: getTrainerRefreshToken() }) }),
  trainerLogout: () => trainerRequest("/trainer/logout", { method: "POST", body: JSON.stringify({ refreshToken: getTrainerRefreshToken() }) }),

  // Quiz
  submitQuiz: (body: any) => request("/quiz", { method: "POST", body: JSON.stringify(body) }),
  
  // Gets the questions that were generated during onboarding (stored in user profile)
  getDynamicQuiz: async (userId: string) => {
    const me = await request("/api/me");
    if (me?.userDetails?.dynamicQuizData) {
      // Map the generic structure to our frontend interface
      // Note: Adjust 'questions' path if your API returns { data: { questions: [] } } or just { questions: [] }
      const quizData = me.userDetails.dynamicQuizData;
      // Handle different possible structures from the external API
      const questionsArray = Array.isArray(quizData) ? quizData : (quizData.questions || quizData.data?.questions || []);
      
      return questionsArray.map((q: any, index: number) => ({
        id: q.id || String(index),
        question: q.question_text || q.question || "Question",
        options: q.options || []
      }));
    }
    return [];
  },

  saveDynamicQuiz: (body: any) => request("/api/me", { method: "POST", body: JSON.stringify(body) }),

  // Auth Providers
  startGoogle: () => `${API_BASE}/auth/google`,

  // Recommendations
  getRecommendations: () => request<{ items: any[] }>("/api/recommendations"),
  getPathwayById: (id: string) => request<any>(`/api/pathways/${id}`),
  getPathwayGraph: (id: string) => request<{ nodes: any[]; links: any[] }>(`/api/pathways/${id}/graph`),
  getCourseById: (id: string) => request<any>(`/api/courses/${id}`),
  
  // Skill India
  getSkillIndiaCourses: (id: string) => request<any[]>(`/api/recommendations/skill-india/${id}`),
  getAllSkillIndiaCourses: (page = 1, limit = 20, search = '') => 
    request<any[]>(`/api/skill-india/all?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),

  // Videos
  searchVideos: (query: string) => request<YouTubeVideo[]>(`/api/videos/search?q=${encodeURIComponent(query)}`),

  // Jobs
  getJobs: (userSector: string, limit: number = 6) => 
    request<{ success: boolean; mappedSector: string; jobs: Job[] }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify({ neo4jSector: userSector, limit }),
    }),
};