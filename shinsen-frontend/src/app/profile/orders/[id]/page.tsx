"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation"; // <-- Dùng để lấy ID từ URL
import Link from "next/link";
import Image from "next/image";
import styles from "./OrderDetail.module.css"; // <-- File CSS mới
import {
  FiArchive,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiHome,
  FiPhone,
  FiCreditCard,
} from "react-icons/fi";

// Interface cho 1 sản phẩm
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string[] | null;
}
// Interface cho 1 đơn hàng
interface Order {
  id: number;
  order_code: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: string;
  phone_number: string;
  full_name: string;
  payment_method: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const { id: orderId } = params; // Lấy 'id' từ URL (vd: /profile/orders/1)
  const { token } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !orderId) return;

    const fetchOrderDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            "Không tìm thấy đơn hàng hoặc bạn không có quyền xem."
          );
        }
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, token]);

  // Hàm dịch status
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

  const getFirstImage = (imageUrl: string[] | null) => {
    if (imageUrl && imageUrl.length > 0) {
      let firstImage = imageUrl[0].trimEnd();
      if (firstImage.startsWith("http") || firstImage.startsWith("/")) {
        return firstImage;
      }
    }
    return "/placeholder.png";
  };

  if (isLoading) {
    return <div className={styles.message}>Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return <div className={styles.message}>{error}</div>;
  }

  if (!order) {
    return <div className={styles.message}>Không có thông tin đơn hàng.</div>;
  }

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.detailHeader}>
        <h1 className={styles.orderTitle}>
          Chi tiết đơn hàng: #{order.order_code}
        </h1>
        {renderOrderStatus(order.status)}
      </div>

      <div className={styles.detailGrid}>
        {/* CỘT BÊN TRÁI (SẢN PHẨM) */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Sản phẩm đã đặt</h3>
            <div className={styles.orderItemsList}>
              {order.items.map((item, index) => (
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
          </div>
        </div>

        {/* CỘT BÊN PHẢI (THÔNG TIN) */}
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiHome /> Thông tin nhận hàng
            </h3>
            <div className={styles.shippingInfo}>
              <p>
                <strong>{order.full_name}</strong>
              </p>
              <p>
                <FiPhone className={styles.icon} /> {order.phone_number}
              </p>
              <p>{order.shipping_address}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FiCreditCard /> Tóm tắt thanh toán
            </h3>
            <div className={styles.costSummary}>
              <div className={styles.costRow}>
                <span>Phương thức</span>
                <span>{order.payment_method.toUpperCase()}</span>
              </div>
              <div className={styles.costRow}>
                <span>Tạm tính</span>
                <span>{Number(order.total).toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className={styles.costRow}>
                <span>Phí vận chuyển</span>
                <span>Miễn phí</span>
              </div>
              <div className={`${styles.costRow} ${styles.grandTotal}`}>
                <span>Tổng cộng</span>
                <span>{Number(order.total).toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerActions}>
        <Link href="/profile/orders" className={styles.backButton}>
          Quay lại danh sách
        </Link>
        {order.status === "delivered" && (
          <Link
            href={`/profile/review?order_id=${order.id}`}
            className={styles.reviewButton}
          >
            Viết đánh giá
          </Link>
        )}
      </div>
    </div>
  );
}
