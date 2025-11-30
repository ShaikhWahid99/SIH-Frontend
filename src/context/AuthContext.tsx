import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { saveTokens, clearTokens, getAccessToken } from "@/lib/auth";

interface UserType {
  id: string;
  email: string;
  displayName: string;
  onboarded: boolean;
  quizCompleted: boolean;
  userDetails: any | null;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (body: any) => Promise<any>;
  refreshUser: () => Promise<any>;
  logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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


  useEffect(() => {
    if (getAccessToken()) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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

   const register = async (body: any) => {
    await api.register(body);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        refreshUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
