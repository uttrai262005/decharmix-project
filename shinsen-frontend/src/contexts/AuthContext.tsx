"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-hot-toast"; // (Thêm toast để thông báo)

// Interface User (Lấy từ file của bạn, đã đủ 7 vé)
interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
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

// Lấy URL Backend từ file .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // === SỬA LỖI 1: SỬA HÀM FETCH PROFILE ===
  const fetchUserProfile = async (currentToken: string) => {
    if (!API_URL) {
      console.error("Lỗi: NEXT_PUBLIC_API_URL chưa được cấu hình.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!response.ok) throw new Error("Phiên đăng nhập không hợp lệ.");

      const freshUserData = await response.json();
      setUser(freshUserData);
      setToken(currentToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      localStorage.removeItem("decharmix_token");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  // ======================================

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("decharmix_token");
      if (storedToken) {
        try {
          jwtDecode(storedToken);
          await fetchUserProfile(storedToken);
        } catch (error) {
          localStorage.removeItem("decharmix_token");
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // (Hàm Login giữ nguyên)
  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem("decharmix_token", jwtToken);
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);

    if (userData.role === "admin") {
      window.location.href = "/dashboard";
    } else {
      // (Thêm toast chào mừng)
      toast.success(
        `Chào mừng trở lại, ${userData.full_name || userData.name}!`
      );
      window.location.href = "/";
    }
  };

  // (Hàm Logout giữ nguyên)
  const logout = () => {
    localStorage.removeItem("decharmix_token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  // (Hàm updateUser giữ nguyên)
  const updateUser = (newUserData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...newUserData } : null));
  };

  // === SỬA LỖI 2: SỬA HÀM REFRESH STATS ===
  const refreshUserStats = async () => {
    const currentToken = localStorage.getItem("decharmix_token");
    if (currentToken && API_URL) {
      console.log("Đang làm mới thông tin User (Tất cả vé)...");
      try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (!response.ok) throw new Error("Phiên đăng nhập không hợp lệ.");
        const freshUserData = await response.json();
        setUser(freshUserData); // Cập nhật lại user
      } catch (error) {
        console.error("Lỗi làm mới:", error);
        logout(); // Đăng xuất nếu lỗi
      }
    }
  };
  // ======================================

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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
