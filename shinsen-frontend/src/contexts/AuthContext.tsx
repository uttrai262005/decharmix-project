"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

// Interface User (Đã đầy đủ 7 vé + role - theo file của bạn)
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
  claw_plays: number; // (Bạn đã thêm lại 'claw_plays' ở file [135])
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // State theo dõi việc tải

  // Hàm lấy profile (dùng chung)
  const fetchUserProfile = async (currentToken: string) => {
    try {
      const response = await fetch("/api/users/profile", {
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
      setIsLoading(false); // Báo là đã tải xong (dù thành công hay thất bại)
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("decharmix_token");
      if (storedToken) {
        try {
          jwtDecode(storedToken); // Kiểm tra token hợp lệ
          await fetchUserProfile(storedToken);
        } catch (error) {
          // Token hỏng hoặc hết hạn
          localStorage.removeItem("decharmix_token");
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setIsLoading(false); // Báo tải xong
        }
      } else {
        setIsLoading(false); // Không có token, tải xong
      }
    };
    initializeAuth();
  }, []);

  // === ĐÃ SỬA HÀM LOGIN (Tự động chuyển hướng) ===
  const login = (jwtToken: string, userData: User) => {
    localStorage.setItem("decharmix_token", jwtToken);
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);

    // Tự động phát hiện vai trò và chuyển hướng
    if (userData.role === "admin") {
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/";
    }
  };
  // =============================================

  const logout = () => {
    localStorage.removeItem("decharmix_token");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    window.location.href = "/login"; // Chuyển hướng về login
  };

  const updateUser = (newUserData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...newUserData } : null));
  };

  const refreshUserStats = async () => {
    const currentToken = localStorage.getItem("decharmix_token");
    if (currentToken) {
      console.log("Đang làm mới thông tin User (Tất cả vé)...");
      await fetchUserProfile(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        isLoading, // Thêm isLoading vào value
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
