"use client";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./ProfileLayout.module.css"; // <-- 1. Import CSS mới
import {
  FiUser,
  FiShoppingBag,
  FiGift,
  FiLogOut,
  FiChevronRight,
  FiDollarSign,
} from "react-icons/fi";

// (Danh sách menu cho sidebar)
const sidebarNav = [
  { href: "/profile", label: "Tài khoản của tôi", icon: <FiUser /> },
  {
    href: "/profile/orders",
    label: "Lịch sử đơn hàng",
    icon: <FiShoppingBag />,
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Nếu chưa tải xong, hoặc đã tải xong và không có user (chưa đăng nhập)
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // === 2. HÀM SỬA LỖI AVATAR ===
  const getAvatarSrc = () => {
    if (!user?.avatar_url) {
      return "/default-avatar.png"; // Ảnh dự phòng
    }

    // Nếu avatar_url đã là link tuyệt đối (Google)
    if (user.avatar_url.startsWith("http")) {
      return user.avatar_url;
    }

    // Nếu là link tương đối (tự upload)
    return `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}`;
  };
  // ============================

  if (isLoading || !user) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader}>🌀</div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.profileContainer}>
        {/* === Sidebar (Cột Trái) === */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.avatarWrapper}>
              {/* === 3. SỬA LỖI JSX === */}
              <Image
                src={getAvatarSrc()}
                alt={user.full_name || "Avatar"}
                fill
                style={{ objectFit: "cover" }}
                sizes="50px"
              />
              {/* ===================== */}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.full_name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {sidebarNav.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={`${styles.navItem} ${
                  pathname === item.href ? styles.navActive : ""
                }`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                <FiChevronRight className={styles.navArrow} />
              </Link>
            ))}

            <button
              onClick={logout}
              className={`${styles.navItem} ${styles.navLogout}`}
            >
              <span className={styles.navIcon}>
                <FiLogOut />
              </span>
              <span className={styles.navLabel}>Đăng xuất</span>
            </button>
          </nav>
        </aside>

        {/* === Content (Cột Phải) === */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
