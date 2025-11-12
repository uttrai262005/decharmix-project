"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiGift,
  FiAward,
  FiSettings,
  FiFileText,
} from "react-icons/fi";

const menuItems = [
  { href: "/dashboard", icon: <FiGrid />, label: "Dashboard" },
  { href: "/orders", icon: <FiShoppingBag />, label: "Đơn hàng" },
  { href: "/manage-products", icon: <FiPackage />, label: "Sản phẩm" },
  { href: "/vouchers", icon: <FiTag />, label: "Mã Giảm Giá" },
  { href: "/gamification", icon: <FiAward />, label: "Gamification" },
  { href: "/customers", icon: <FiUsers />, label: "Khách hàng" },
  { href: "/settings", icon: <FiSettings />, label: "Cài đặt" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Decharmix ADMIN</div>
      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const href = item.href;
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              href={href}
              key={item.label}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              {item.icon}
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
