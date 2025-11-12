"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import styles from "./OrdersPage.module.css";
import { FiArchive, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

// Interface đã cập nhật
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string[] | null;
}

interface Order {
  id: number;
  order_code: string;
  total_price: number; // <-- SỬA LỖI 1: Đổi 'total' thành 'total_price'
  status: string;
  created_at: string;
  items: OrderItem[];
}

// === SỬA LỖI 2: THÊM BỘ DỊCH GIỐNG ADMIN ===
interface OrderResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
}
const TABS = [
  "Tất cả",
  "Chờ xác nhận", // (pending_payment)
  "Chờ lấy hàng", // (processing)
  "Đang vận chuyển", // (shipping)
  "Hoàn thành", // (delivered)
  "Đã hủy", // (cancelled)
];
// (Thêm map này để dịch Tiếng Việt sang Tiếng Anh)
const STATUS_MAP: { [key: string]: string } = {
  "Tất cả": "Tất cả",
  "Chờ xác nhận": "pending_payment",
  "Chờ lấy hàng": "processing",
  "Đang vận chuyển": "shipping",
  "Hoàn thành": "delivered",
  "Đã hủy": "cancelled",
};
// ==========================================

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // === SỬA LỖI 2: Dịch status trước khi gửi ===
        const status = STATUS_MAP[activeTab] || "Tất cả";

        const response = await fetch(
          `/api/orders?status=${encodeURIComponent(status)}`, // (Gửi Tiếng Anh)
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error("Không thể tải đơn hàng");
        }

        const data: OrderResponse = await response.json();

        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, token]);

  // (Hàm renderOrderStatus giữ nguyên)
  const renderOrderStatus = (status: string) => {
    switch (status) {
      case "pending_payment":
        return (
          <span className={styles.statusPending}>
            <FiArchive /> Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className={styles.statusProcessing}>
            <FiArchive /> Chờ lấy hàng
          </span>
        );
      case "pending_recipient":
        return (
          <span className={styles.statusPending}>
            <FiArchive /> Chờ nhận quà
          </span>
        );
      case "shipping":
        return (
          <span className={styles.statusShipping}>
            <FiTruck /> Đang vận chuyển
          </span>
        );
      case "delivered":
        return (
          <span className={styles.statusCompleted}>
            <FiCheckCircle /> Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className={styles.statusCancelled}>
            <FiXCircle /> Đã hủy
          </span>
        );
      default:
        return <span className={styles.statusDefault}>{status}</span>;
    }
  };

  // (Hàm getFirstImage giữ nguyên)
  const getFirstImage = (imageUrl: string[] | null) => {
    if (imageUrl && imageUrl.length > 0) {
      let firstImage = imageUrl[0].trimEnd();
      if (firstImage.startsWith("http") || firstImage.startsWith("/")) {
        return firstImage;
      }
    }
    return "/placeholder.png";
  };

  return (
    <div className={styles.orderHistoryWrapper}>
      {/* Thanh điều hướng Tabs (Giữ nguyên) */}
      <nav className={styles.tabNav}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Hiển thị danh sách đơn hàng (Giữ nguyên) */}
      <div className={styles.orderList}>
        {isLoading ? (
          <p className={styles.loadingMessage}>Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className={styles.emptyMessage}>
            Chưa có đơn hàng nào trong mục này.
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span>
                  Mã đơn:{" "}
                  <strong>{order.order_code || `DECHARMIX${order.id}`}</strong>
                </span>
                {renderOrderStatus(order.status)}
              </div>

              <div className={styles.orderBody}>
                {order.items &&
                  order.items.map((item, index) => (
                    <div key={index} className={styles.orderItem}>
                      <div className={styles.itemImage}>
                        <Image
                          src={getFirstImage(item.image_url)}
                          alt={item.name}
                          width={70}
                          height={70}
                        />
                      </div>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemQuantity}>x {item.quantity}</p>
                      </div>
                      <div className={styles.itemPrice}>
                        {Number(item.price).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  ))}
              </div>

              <div className={styles.orderSummary}>
                <p>
                  Ngày đặt:{" "}
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </p>

                {/* === SỬA LỖI 1: Đổi 'order.total' thành 'order.total_price' === */}
                <p>
                  Thành tiền:{" "}
                  <strong>
                    {Number(order.total_price).toLocaleString("vi-VN")} ₫
                  </strong>
                </p>
                {/* ========================================================== */}
              </div>

              <div className={styles.orderFooter}>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className={styles.detailButton}
                >
                  Xem chi tiết
                </Link>
                {order.status === "delivered" && (
                  <Link
                    href={`/profile/review?order_id=${order.id}`}
                    className={styles.reviewButton}
                  >
                    Đánh giá
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
