"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "@/styles/AdminPage.module.css";
import formStyles from "@/styles/AdminForm.module.css";
import { FiArrowLeft, FiSave, FiUser, FiGift, FiTrello } from "react-icons/fi";
import toast from "react-hot-toast";
import tableStyles from "@/styles/AdminTable.module.css";

// Dùng lại interface User (đã có role và 7 vé)
interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  coins: number;
  role: string;
  spin_tickets: number;
  box_keys: number;
  memory_plays: number;
  whac_plays: number;
  jump_plays: number;
  slice_plays: number;
}

export default function CustomerEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tải dữ liệu Khách hàng
  useEffect(() => {
    if (!token || !id) return;

    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không tìm thấy khách hàng");
        setCustomer(await res.json());
      } catch (error: any) {
        toast.error(error.message);
        router.push("/customers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [token, id, router]);

  // 2. Hàm xử lý thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  // 3. Hàm Lưu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customer),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");

      toast.success("Cập nhật khách hàng thành công!");
      router.push("/customers");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.pageTitle}>Đang tải...</div>;
  }

  return (
    <div>
      <Link href="/customers" className={styles.backButton}>
        <FiArrowLeft /> Quay lại danh sách
      </Link>

      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          Sửa Khách hàng: {customer.full_name}
        </h1>
        <button
          onClick={handleSubmit}
          className={tableStyles.createButton}
          disabled={isSaving}
        >
          <FiSave /> {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.formLayout}>
        {/* Cột trái: Thông tin cá nhân */}
        <div className={formStyles.leftColumn}>
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>
              <FiUser /> Thông tin cá nhân
            </h3>
            <div className={formStyles.inputGroup}>
              <label htmlFor="full_name">Họ và Tên</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={customer.full_name || ""}
                onChange={handleChange}
              />
            </div>
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={customer.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={customer.phone || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Ví Xu và Vé */}
        <div className={formStyles.rightColumn}>
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>
              <FiGift /> Ví (Xu & Vé Game)
            </h3>
            <div className={formStyles.inputGroup}>
              <label htmlFor="coins">Decharmix Xu</label>
              <input
                id="coins"
                name="coins"
                type="number"
                value={customer.coins || 0}
                onChange={handleChange}
              />
            </div>

            <h4 className={formStyles.subTitle}>
              <FiTrello /> Vé Game
            </h4>
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="spin_tickets">Vòng Quay</label>
                <input
                  id="spin_tickets"
                  name="spin_tickets"
                  type="number"
                  value={customer.spin_tickets || 0}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="box_keys">Hộp Quà</label>
                <input
                  id="box_keys"
                  name="box_keys"
                  type="number"
                  value={customer.box_keys || 0}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="memory_plays">Lật Hình</label>
                <input
                  id="memory_plays"
                  name="memory_plays"
                  type="number"
                  value={customer.memory_plays || 0}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="whac_plays">Săn Charm</label>
                <input
                  id="whac_plays"
                  name="whac_plays"
                  type="number"
                  value={customer.whac_plays || 0}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="jump_plays">Charm Nhảy</label>
                <input
                  id="jump_plays"
                  name="jump_plays"
                  type="number"
                  value={customer.jump_plays || 0}
                  onChange={handleChange}
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="slice_plays">Chém Charm</label>
                <input
                  id="slice_plays"
                  name="slice_plays"
                  type="number"
                  value={customer.slice_plays || 0}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
