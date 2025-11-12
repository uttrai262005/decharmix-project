import AdminProtect from "@/components/Admin/AdminProtect";
import Sidebar from "@/components/Admin/Sidebar/Sidebar";
import styles from "@/styles/AdminLayout.module.css"; // (CSS ở bước 6)

// Đây là layout CHÍNH của trang Admin
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtect>
      {" "}
      {/* Bọc mọi thứ trong cổng bảo vệ */}
      <div className={styles.adminLayout}>
        <Sidebar /> {/* Menu bên trái */}
        <main className={styles.mainContent}>
          {/* (Chúng ta có thể thêm 1 Header Admin ở đây sau) */}
          <div className={styles.contentWrapper}>
            {children} {/* Đây là các trang con (Dashboard, Products...) */}
          </div>
        </main>
      </div>
    </AdminProtect>
  );
}
