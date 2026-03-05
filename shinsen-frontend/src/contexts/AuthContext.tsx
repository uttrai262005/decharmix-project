"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  coins: number;
  role: string;
  spin_tickets: number;
  box_keys: number;
  memory_plays: number;
  whac_plays: number;
  jump_plays: number;
  claw_plays: number;
  slice_plays: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (newUserData: Partial<User>) => void;
  refreshUserStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// DỌN DẸP URL
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (response.status === 401) {
        logout();
        return;
      }
      if (!response.ok) return; // Nếu 404 hoặc lỗi khác thì không logout

      const freshUserData = await response.json();
      setUser(freshUserData);
      setIsAuthenticated(true);
      setToken(currentToken);
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("decharmix_token");
    if (storedToken) {
      try {
        setToken(storedToken);
        setIsAuthenticated(true);
        fetchUserProfile(storedToken);
      } catch (e) {
        logout();
      }
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem("decharmix_token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setIsAuthenticated(true);
    toast.success(`Chào mừng ${userData.full_name || userData.name}!`);
    userData.role === "admin" ? router.push("/dashboard") : router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("decharmix_token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const refreshUserStats = async () => {
    const currentToken = token || localStorage.getItem("decharmix_token");
    if (currentToken) await fetchUserProfile(currentToken);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser: (data) =>
          setUser((prev) => (prev ? { ...prev, ...data } : null)),
        refreshUserStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
