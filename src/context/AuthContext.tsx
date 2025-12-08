import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  saveTokens,
  clearTokens,
  getAccessToken,
  saveTrainerTokens,
  clearTrainerTokens,
  getTrainerAccessToken,
} from "@/lib/auth";

interface UserType {
  id: string;
  email: string;
  displayName: string;
  onboarded: boolean;
  quizCompleted: boolean;
  dynamicQuizCompleted?: boolean;
  userDetails: any | null;
}

interface TrainerType {
  id: string;
  email: string;
  displayName: string;
  sector: string;
}

interface AuthContextType {
  user: UserType | null;
  trainer: TrainerType | null;

  loading: boolean;
  isAuthenticated: boolean;
  isTrainerAuthenticated: boolean;

  login: (email: string, password: string) => Promise<any>;
  loginTrainer: (body: any) => Promise<any>;

  register: (body: any) => Promise<any>;

  refreshUser: () => Promise<any>;
  refreshTrainerSession: () => Promise<any>;

  logout: () => Promise<any>;
  logoutTrainer: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(true);

  // Learner
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Trainer
  const [trainer, setTrainer] = useState<TrainerType | null>(null);
  const [isTrainerAuthenticated, setIsTrainerAuthenticated] = useState(false);

  // ============================================================
  // LEARNER REFRESH SESSION
  // ============================================================
  const refreshUser = async (): Promise<UserType | null> => {
    try {
      const res = await api.getMe();
      const u = res?.data || res;

      if (u) {
        setUser(u);
        setIsAuthenticated(true);
        return u;
      }
    } catch (err) {
      console.error("refreshUser error:", err);
      setUser(null);
      setIsAuthenticated(false);
    }
    return null;
  };

  // ============================================================
  // TRAINER REFRESH SESSION
  // (renamed to avoid name conflict)
  // ============================================================
  const refreshTrainerSession = async (): Promise<TrainerType | null> => {
    try {
      const res = await api.trainerGetMe();
      const t = res?.trainer || null;

      if (t) {
        setTrainer(t);
        setIsTrainerAuthenticated(true);
        return t;
      }
    } catch (err) {
      console.error("refreshTrainerSession error:", err);
      clearTrainerTokens();
      setTrainer(null);
      setIsTrainerAuthenticated(false);
    }
    return null;
  };

  // ============================================================
  // INITIAL LOAD (Learner or Trainer)
  // ============================================================
  useEffect(() => {
    async function init() {
      if (getAccessToken()) {
        await refreshUser();
      }
      if (getTrainerAccessToken()) {
        await refreshTrainerSession();
      }
      setLoading(false);
    }
    init();
  }, []);

  // ============================================================
  // LEARNER LOGIN
  // ============================================================
  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);

    if (res?.accessToken && res?.refreshToken) {
      saveTokens(res.accessToken, res.refreshToken);
    }

    if (res?.user) {
      setUser(res.user);
      setIsAuthenticated(true);
      return res.user;
    }

    return refreshUser();
  };

  // ============================================================
  // TRAINER LOGIN
  // ============================================================
  const loginTrainer = async (body: any) => {
    const res = await api.trainerLogin(body);

    if (res?.accessToken && res?.refreshToken) {
      saveTrainerTokens(res.accessToken, res.refreshToken);
    }

    if (res?.trainer) {
      setTrainer(res.trainer);
      setIsTrainerAuthenticated(true);
      return res.trainer;
    }

    return refreshTrainerSession();
  };

  // ============================================================
  // REGISTER (Learner)
  // ============================================================
  const register = async (body: any) => {
    await api.register(body);
  };

  // ============================================================
  // LOGOUT (Learner)
  // ============================================================
  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  // ============================================================
  // LOGOUT (Trainer)
  // ============================================================
  const logoutTrainer = async () => {
    try {
      await api.trainerLogout();
    } catch {}
    clearTrainerTokens();
    setTrainer(null);
    setIsTrainerAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        trainer,
        loading,
        isAuthenticated,
        isTrainerAuthenticated,

        login,
        loginTrainer,
        register,

        refreshUser,
        refreshTrainerSession,

        logout,
        logoutTrainer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
