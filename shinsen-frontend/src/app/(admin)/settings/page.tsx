"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/AdminPage.module.css";
import formStyles from "@/styles/AdminForm.module.css";
import { FiSave, FiDollarSign, FiPercent } from "react-icons/fi";
import toast from "react-hot-toast";
import tableStyles from "@/styles/AdminTable.module.css";

// Định nghĩa kiểu Cài đặt
interface Settings {
  SHIPPING_FEE: { value: string; description: string };
  COIN_REDEMPTION_PERCENT: { value: string; description: string };
}

// State chỉ lưu giá trị
interface SettingValues {
  SHIPPING_FEE: string;
  COIN_REDEMPTION_PERCENT: string;
}

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = useState<SettingValues>({
    SHIPPING_FEE: "0",
    COIN_REDEMPTION_PERCENT: "0",
  });
  const [descriptions, setDescriptions] = useState({
    SHIPPING_FEE: "",
    COIN_REDEMPTION_PERCENT: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tải Cài đặt
  useEffect(() => {
    if (!token) return;

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải cài đặt");

        const data: Settings = await res.json();

        // Tách giá trị và mô tả
        setSettings({
          SHIPPING_FEE: data.SHIPPING_FEE.value,
          COIN_REDEMPTION_PERCENT: data.COIN_REDEMPTION_PERCENT.value,
        });
        setDescriptions({
          SHIPPING_FEE: data.SHIPPING_FEE.description,
          COIN_REDEMPTION_PERCENT: data.COIN_REDEMPTION_PERCENT.description,
        });
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  // 2. Hàm xử lý thay đổi
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Hàm Lưu (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings), // Gửi object { SHIPPING_FEE: '...', ... }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");

      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.pageTitle}>Đang tải cài đặt...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Cài đặt Cửa hàng</h1>
        <button
          onClick={handleSubmit}
          className={tableStyles.createButton}
          disabled={isSaving}
        >
          <FiSave /> {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.formLayout}>
        {/* Chỉ dùng 1 cột */}
        <div className={formStyles.leftColumn}>
          {/* Card Vận chuyển */}
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>
              <FiDollarSign /> Cài đặt Thanh toán
            </h3>
            <div className={formStyles.inputGroup}>
              <label htmlFor="SHIPPING_FEE">Phí Vận Chuyển (VND)</label>
              <input
                id="SHIPPING_FEE"
                name="SHIPPING_FEE"
                type="number"
                value={settings.SHIPPING_FEE}
                onChange={handleChange}
              />
              <p className={formStyles.helpText}>{descriptions.SHIPPING_FEE}</p>
            </div>
          </div>

          {/* Card Tích điểm */}
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>
              <FiPercent /> Cài đặt Tích điểm
            </h3>
            <div className={formStyles.inputGroup}>
              <label htmlFor="COIN_REDEMPTION_PERCENT">
                Tỷ lệ dùng Xu (0.0 - 1.0)
              </label>
              <input
                id="COIN_REDEMPTION_PERCENT"
                name="COIN_REDEMPTION_PERCENT"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.COIN_REDEMPTION_PERCENT}
                onChange={handleChange}
              />
              <p className={formStyles.helpText}>
                {descriptions.COIN_REDEMPTION_PERCENT}
              </p>
            </div>
          </div>
        </div>

        {/* Bỏ trống cột phải */}
        <div className={formStyles.rightColumn}>
          {/* (Bạn có thể thêm các cài đặt API Key (VNPay, Momo...) ở đây sau) */}
        </div>
      </form>
    </div>
  );
}
