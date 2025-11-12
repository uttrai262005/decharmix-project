"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";
import styles from "@/styles/Login.module.css";
import { FiLogIn, FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc"; // <-- 1. Import icon Google

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        // (Dùng relative path)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đã có lỗi xảy ra.");
      login(data.token, data.user);
    } catch (err: any) {
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Đăng nhập Decharmix</h1>

        {/* === 2. THÊM NÚT GOOGLE === */}
        {/* Nút này là <a> tag, KHÔNG phải <button> */}
        <a
          href="http://localhost:5000/api/users/auth/google"
          className={`${styles.button} ${styles.googleButton}`}
        >
          <FcGoogle />
          Đăng nhập bằng Google
        </a>

        <div className={styles.divider}>Hoặc đăng nhập bằng email</div>
        {/* ======================= */}

        <form onSubmit={handleSubmit} className={styles.form}>
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
              autoComplete="current-password"
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
              <FiMail /> {/* (Đổi icon) */}
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <p className={styles.footerText}>
          Bạn chưa có tài khoản?{" "}
          <Link href="/register" className={styles.link}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
