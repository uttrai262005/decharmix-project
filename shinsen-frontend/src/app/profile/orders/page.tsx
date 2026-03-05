"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import styles from "./OrdersPage.module.css";
import { FiArchive, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

// === XỬ LÝ URL AN TOÀN ===
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

// Interface đã cập nhật
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string[] | string | null; // Có thể Backend trả về mảng hoặc chuỗi
}

interface Order {
  id: number;
  order_code: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[] | string; // Đề phòng Backend trả items dưới dạng JSON string
}

// BỘ DỊCH GIỐNG ADMIN
interface OrderResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
}
const TABS = [
  "Tất cả",
  "Chờ xác nhận",
  "Chờ lấy hàng",
  "Đang vận chuyển",
  "Hoàn thành",
  "Đã hủy",
];

const STATUS_MAP: { [key: string]: string } = {
  "Tất cả": "Tất cả",
  "Chờ xác nhận": "pending_payment",
  "Chờ lấy hàng": "processing",
  "Đang vận chuyển": "shipping",
  "Hoàn thành": "delivered",
  "Đã hủy": "cancelled",
};

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
        const status = STATUS_MAP[activeTab] || "Tất cả";
        // Gắn API_URL vào đường dẫn gọi fetch
        const response = await fetch(
          `${API_URL}/api/orders?status=${encodeURIComponent(status)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error("Không thể tải đơn hàng");
        }

        const data: OrderResponse = await response.json();

        // Đảm bảo data là một mảng hợp lệ
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data); // Đề phòng API trả thẳng mảng
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Lỗi fetch đơn hàng:", error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, token]);

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

  // Hàm xử lý ảnh an toàn hơn, phòng trường hợp Backend trả về chuỗi JSON
  const getFirstImage = (imageUrl: any) => {
    if (!imageUrl) return "/placeholder.png";

    try {
      // Nếu nó là mảng thực sự
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        const first = imageUrl[0].trim();
        return first.startsWith("http") || first.startsWith("/")
          ? first
          : "/placeholder.png";
      }

      // Nếu Backend lưu mảng dưới dạng chuỗi (ví dụ: '["https://..."]')
      if (typeof imageUrl === "string") {
        // Thử parse xem có phải JSON không
        if (imageUrl.startsWith("[")) {
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
        // Nếu chỉ là link ảnh bình thường
        if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
          return imageUrl;
        }
      }
    } catch (e) {
      console.error("Lỗi parse ảnh:", e);
    }
    return "/placeholder.png";
  };

  // Hàm parse items an toàn, phòng trường hợp Backend lưu JSON string
  const getOrderItems = (items: any): OrderItem[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === "string") {
      try {
        return JSON.parse(items);
      } catch (e) {
        console.error("Lỗi parse items:", e);
        return [];
      }
    }
    return [];
  };

  return (
    <div className={styles.orderHistoryWrapper}>
      <nav className={styles.tabNav}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.orderList}>
        {isLoading ? (
          <p className={styles.loadingMessage}>Đang tải đơn hàng...</p>
        ) : orders.length === 0 ? (
          <p className={styles.emptyMessage}>
            Chưa có đơn hàng nào trong mục này.
          </p>
        ) : (
          orders.map((order) => {
            const safeItems = getOrderItems(order.items);
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span>
                    Mã đơn:{" "}
                    <strong>
                      {order.order_code || `DECHARMIX${order.id}`}
                    </strong>
                  </span>
                  {renderOrderStatus(order.status)}
                </div>

                <div className={styles.orderBody}>
                  {safeItems.length > 0 ? (
                    safeItems.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.itemImage}>
                          <Image
                            src={getFirstImage(item.image_url)}
                            alt={item.name || "Sản phẩm"}
                            width={70}
                            height={70}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <p className={styles.itemName}>{item.name}</p>
                          <p className={styles.itemQuantity}>
                            x {item.quantity}
                          </p>
                        </div>
                        <div className={styles.itemPrice}>
                          {Number(item.price).toLocaleString("vi-VN")} ₫
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ padding: "10px", color: "#888" }}>
                      Không có thông tin sản phẩm.
                    </p>
                  )}
                </div>

                <div className={styles.orderSummary}>
                  <p>
                    Ngày đặt:{" "}
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  <p>
                    Thành tiền:{" "}
                    <strong>
                      {Number(order.total_price).toLocaleString("vi-VN")} ₫
                    </strong>
                  </p>
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
            );
          })
        )}
      </div>
    </div>
  );
}
