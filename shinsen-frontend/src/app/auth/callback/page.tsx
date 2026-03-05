"use client";

import { useEffect, Suspense } from "react"; // Thêm import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

// (CSS cho trang Loading)
const styles = {
  loaderWrapper: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#fff5f9",
    color: "#be5985",
  },
  loader: {
    fontSize: "2rem",
  },
  text: {
    fontSize: "1.2rem",
    marginTop: "1rem",
  },
};

// 1. Tách phần logic hiện tại thành một Component con
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Đăng nhập Google thất bại: " + error);
      router.push("/login");
      return;
    }

    if (token && userParam) {
      try {
        // Giải mã user data
        const user = JSON.parse(decodeURIComponent(userParam));
        // Gọi hàm login của AuthContext
        login(token, user);
        // (Hàm login sẽ tự động chuyển hướng)
      } catch (e) {
        toast.error("Lỗi xử lý dữ liệu đăng nhập.");
        router.push("/login");
      }
    } else {
      toast.error("Không nhận được thông tin đăng nhập.");
      router.push("/login");
    }
  }, [searchParams, router, login]);

  return (
    <div style={styles.loaderWrapper}>
      <span style={styles.loader}>🌀</span>
      <p style={styles.text}>Đang xác thực, vui lòng chờ...</p>
    </div>
  );
}

// 2. Tạo Component mặc định và bọc Component con bằng Suspense
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.loaderWrapper}>
          <span style={styles.loader}>🌀</span>
          <p style={styles.text}>Đang tải dữ liệu...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
