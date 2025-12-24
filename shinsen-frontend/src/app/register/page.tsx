"use client";

import { toast } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- 1. Import Link
import styles from "@/styles/Login.module.css"; // <-- 2. Dùng chung CSS với Login
import { FiUserPlus } from "react-icons/fi";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // <-- Thêm state Loading

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // <-- Bật loading

    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
      setIsLoading(false);
      return;
    }

    try {
      // === 3. Sửa lỗi: Dùng relative path & gửi 'name' ===
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Backend (userController) đang nhận 'name', không phải 'fullName'
        body: JSON.stringify({ name: fullName, email, password }),
      });
      // ===============================================

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đã có lỗi xảy ra.");
      }

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err: any) {
      console.error("Lỗi khi đăng ký:", err);
      toast.error(err.message);
      setIsLoading(false); // Tắt loading nếu lỗi
    }
  };

  return (
    // === 4. SỬA LẠI TOÀN BỘ GIAO DIỆN ===
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Đăng ký Decharmix</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Họ và Tên</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              <FiUserPlus />
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        {/* 5. THÊM LINK ĐĂNG NHẬP */}
        <p className={styles.footerText}>
          Đã có tài khoản?{" "}
          <Link href="/login" className={styles.link}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
