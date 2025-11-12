"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/AdminPage.module.css";
import tableStyles from "@/styles/AdminTable.module.css";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

interface Voucher {
  id: number;
  code: string;
  description: string;
  type: "fixed" | "percent" | "shipping";
  value: number;
  end_date: string;
  is_active: boolean;
  quantity: number;
  quantity_used: number;
}

export default function AdminVouchersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải tất cả Vouchers
  const fetchVouchers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/vouchers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải vouchers");
      const data: Voucher[] = await res.json();
      setVouchers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [token]);

  // 2. Hàm Xóa Voucher
  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa voucher ${code}?`)) return;

    try {
      const res = await fetch(`/api/vouchers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xóa thất bại");

      toast.success(data.message);
      fetchVouchers(); // Tải lại danh sách
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Định dạng loại voucher
  const formatType = (type: string) => {
    if (type === "fixed") return "Giảm tiền ₫";
    if (type === "percent") return "Giảm %";
    if (type === "shipping") return "Miễn Ship";
    return type;
  };

  // Định dạng giá trị
  const formatValue = (type: string, value: number) => {
    if (type === "fixed") return `${Number(value).toLocaleString("vi-VN")} ₫`;
    if (type === "percent") return `${value}%`;
    return "N/A";
  };

  // Định dạng ngày
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý Mã Giảm Giá</h1>
        <Link href="/vouchers/new" className={tableStyles.createButton}>
          <FiPlus /> Tạo Voucher Mới
        </Link>
      </div>

      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Mô tả</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Hạn SD</th>
              <th>Đã dùng / Tổng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8}>Đang tải...</td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id}>
                  <td data-label="Code" className={tableStyles.code}>
                    {v.code}
                  </td>
                  <td data-label="Mô tả">{v.description}</td>
                  <td data-label="Loại">{formatType(v.type)}</td>
                  <td data-label="Giá trị">{formatValue(v.type, v.value)}</td>
                  <td data-label="Hạn SD">{formatDate(v.end_date)}</td>
                  <td data-label="Đã dùng">
                    {v.quantity_used || 0} / {v.quantity}
                  </td>
                  <td data-label="Trạng thái">
                    {v.is_active ? (
                      <FiCheckCircle color="green" />
                    ) : (
                      <FiXCircle color="red" />
                    )}
                  </td>
                  <td data-label="Hành động">
                    <div className={tableStyles.actionGroup}>
                      <Link
                        href={`/vouchers/${v.id}`}
                        className={tableStyles.actionButtonEdit}
                      >
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id, v.code)}
                        className={tableStyles.actionButtonDelete}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
