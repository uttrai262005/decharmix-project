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
import { useRouter } from "next/navigation"; // Dùng router thay vì href

interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  coins: number;
  role: string;
  // ... các trường khác giữ nguyên
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
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hàm lấy thông tin mới nhất từ Server
  const fetchUserProfile = useCallback(async (currentToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!response.ok) throw new Error("Session expired");
      const freshUserData = await response.json();
      setUser(freshUserData);
      setIsAuthenticated(true);
      setToken(currentToken);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kiểm tra token ngay khi mở trang
  useEffect(() => {
    const storedToken = localStorage.getItem("decharmix_token");
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        // Kiểm tra xem token hết hạn chưa
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setToken(storedToken);
          setIsAuthenticated(true); // Cho phép user "vào cửa" trước
          fetchUserProfile(storedToken); // Cập nhật dữ liệu thật sau
        }
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
    setIsAuthenticated(true); // Cập nhật state ngay lập tức!

    toast.success(`Chào mừng ${userData.full_name || userData.name}!`);

    // Dùng router.push để không làm mất State của React
    if (userData.role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("decharmix_token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  const updateUser = (newUserData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...newUserData } : null));
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
        updateUser,
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
