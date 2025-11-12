"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "@/styles/AdminPage.module.css";
import tableStyles from "@/styles/AdminTable.module.css";
import { FiEye } from "react-icons/fi";
import Pagination from "@/components/Admin/Pagination/Pagination"; // <-- 1. IMPORT

// Định nghĩa kiểu
interface Order {
  id: number;
  order_code: string;
  full_name: string;
  total_price: number;
  status: string;
  created_at: string;
}
interface OrderResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
}

const TABS = [
  "Chờ xử lý",
  "Chờ nhận quà",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
  "Tất cả",
];
const STATUS_MAP: { [key: string]: string } = {
  "Chờ xử lý": "processing",
  "Chờ nhận quà": "pending_recipient",
  "Đang giao": "shipping",
  "Hoàn thành": "delivered",
  "Đã hủy": "cancelled",
  "Tất cả": "Tất cả",
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Chờ xử lý");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      const status = STATUS_MAP[activeTab];

      try {
        // API đã hỗ trợ phân trang
        const res = await fetch(
          `/api/orders?status=${status}&page=${currentPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Không thể tải đơn hàng");

        const data: OrderResponse = await res.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage); // Đảm bảo state được cập nhật
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [token, activeTab, currentPage]); // Chạy lại khi 'currentPage' thay đổi

  // 2. Hàm xử lý khi đổi tab (reset về trang 1)
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset về trang 1 khi đổi tab
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Đơn hàng</h1>

      {/* Thanh Tabs */}
      <div className={tableStyles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${tableStyles.tabButton} ${
              activeTab === tab ? tableStyles.active : ""
            }`}
            onClick={() => handleTabClick(tab)} // <-- 2. SỬA HÀM
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bảng dữ liệu */}
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Mã ĐH</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td data-label="Mã ĐH" className={tableStyles.code}>
                    {order.order_code}
                  </td>
                  <td data-label="Khách hàng">{order.full_name}</td>
                  <td data-label="Ngày đặt">
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td data-label="Tổng tiền" className={tableStyles.price}>
                    {Number(order.total_price).toLocaleString("vi-VN")} ₫
                  </td>
                  <td data-label="Trạng thái">
                    <span
                      className={`${tableStyles.status} ${
                        tableStyles[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Hành động">
                    <Link
                      href={`/orders/${order.id}`}
                      className={tableStyles.actionButton}
                    >
                      <FiEye /> Xem
                    </Link>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td colSpan={6}>Không tìm thấy đơn hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. THÊM COMPONENT PHÂN TRANG */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage} // Gán hàm set state
      />
    </div>
  );
}
