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
  const [orders, setOrders] = useState<any[]>([]);
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
        const response = await fetch(
          `${API_URL}/api/orders?status=${encodeURIComponent(status)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) {
          throw new Error("Không thể tải đơn hàng");
        }

        const data = await response.json();

        // Console log để Trúc có thể xem cấu trúc thật sự nếu cần (F12 -> Console)
        console.log("Dữ liệu đơn hàng từ Backend:", data);

        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
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

  // Hàm xử lý ảnh an toàn tuyệt đối
  const getFirstImage = (imageUrl: any) => {
    if (!imageUrl) return "/placeholder.png";
    try {
      if (Array.isArray(imageUrl) && imageUrl.length > 0) {
        const first = String(imageUrl[0]).trim();
        return first.startsWith("http") || first.startsWith("/")
          ? first
          : "/placeholder.png";
      }
      if (typeof imageUrl === "string") {
        if (imageUrl.startsWith("[")) {
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
        if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) {
          return imageUrl;
        }
      }
    } catch (e) {}
    return "/placeholder.png";
  };

  // === HÀM BẮT LỖI TÌM KIẾM ĐỒ ĐẠC SIÊU CẤP ===
  const getOrderItems = (order: any): any[] => {
    // Dò tìm ở tất cả các tên biến mà Backend có thể trả về
    let items =
      order.items ||
      order.order_items ||
      order.OrderItems ||
      order.products ||
      [];

    // Nếu Backend lưu chuỗi JSON
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(items) ? items : [];
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
            const safeItems = getOrderItems(order);

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
                    safeItems.map((item, index) => {
                      // Dò tìm tên, giá và ảnh ở nhiều cấu trúc lồng nhau khác nhau
                      const itemName =
                        item.name ||
                        item.product_name ||
                        item.product?.name ||
                        "Sản phẩm";
                      const itemPrice =
                        item.price ||
                        item.unit_price ||
                        item.product?.price ||
                        0;
                      const itemQuantity = item.quantity || 1;
                      const itemImage =
                        item.image_url ||
                        item.product?.image_url ||
                        item.image ||
                        null;

                      return (
                        <div key={index} className={styles.orderItem}>
                          <div className={styles.itemImage}>
                            <Image
                              src={getFirstImage(itemImage)}
                              alt={itemName}
                              width={70}
                              height={70}
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                          <div className={styles.itemInfo}>
                            <p className={styles.itemName}>{itemName}</p>
                            <p className={styles.itemQuantity}>
                              x {itemQuantity}
                            </p>
                          </div>
                          <div className={styles.itemPrice}>
                            {Number(itemPrice).toLocaleString("vi-VN")} ₫
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ padding: "10px", color: "#888" }}>
                      Đang tải thông tin sản phẩm...
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
                      {Number(
                        order.total_price || order.total || 0,
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
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
