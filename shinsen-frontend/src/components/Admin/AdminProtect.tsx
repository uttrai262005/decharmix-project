"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Đây là component "bảo vệ" các trang admin
export default function AdminProtect({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đang tải, chưa làm gì
    if (isLoading) {
      return;
    }

    // Nếu tải xong VÀ không có user HOẶC user không phải admin
    if (!isAuthenticated || user?.role !== "admin") {
      // Đá về trang chủ
      router.push("/");
    }
  }, [user, isLoading, isAuthenticated, router]);

  // Nếu đang tải hoặc user không hợp lệ, hiện màn hình loading
  if (isLoading || !user || user.role !== "admin") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#fff5f9",
        }}
      >
        Đang tải trang quản trị...
      </div>
    );
  }

  // Nếu là admin, hiển thị trang
  return <>{children}</>;
}
