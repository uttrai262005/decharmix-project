"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/AdminPage.module.css";
import detailStyles from "@/styles/AdminOrderDetail.module.css";
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiGift,
  FiTruck,
  FiDollarSign,
  FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

// (Interface OrderItem và OrderDetails giữ nguyên)
interface OrderItem {
  product_id: number;
  name: string;
  image_url: string[] | null;
  quantity: number;
  price: number;
}
interface OrderDetails {
  id: number;
  order_code: string;
  created_at: string;
  status: string;
  total: number;
  discount_amount: number;
  coin_discount_amount: number;
  payment_method: string;
  user_name: string;
  user_email: string;
  full_name: string;
  shipping_address: string | null;
  phone_number: string | null;
  is_digital_gift: boolean;
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_message: string | null;
  items: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "processing", label: "Chờ xử lý" },
  { value: "shipping", label: "Đang vận chuyển" },
  { value: "delivered", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

// === SỬA LỖI 1: LẤY API URL ===
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// =============================

export default function AdminOrderDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Tải chi tiết đơn hàng
  useEffect(() => {
    if (!token || !orderId || !API_URL) return;
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        // === SỬA LỖI 2: SỬA ĐƯỜNG DẪN FETCH ===
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ===================================
        if (!res.ok) throw new Error("Không thể tải chi tiết đơn hàng");

        const data: OrderDetails = await res.json();
        setOrder(data);
        setNewStatus(data.status);
      } catch (error) {
        console.error(error);
        toast.error("Tải đơn hàng thất bại");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [token, orderId]);

  // 2. Hàm cập nhật trạng thái
  const handleUpdateStatus = async () => {
    if (!token || !orderId || newStatus === order?.status || !API_URL) return;
    setIsUpdating(true);
    try {
      // === SỬA LỖI 3: SỬA ĐƯỜNG DẪN FETCH ===
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      // ===================================

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");

      // setOrder(data.order);
      setOrder((prevOrder) => {
        if (!prevOrder) return null; // Trường hợp dự phòng
        // Giữ lại tất cả thông tin cũ (quan trọng nhất là mảng 'items')
        // và chỉ cập nhật lại 'status' từ data mới
        return {
          ...prevOrder,
          status: data.order.status,
        };
      });
      setNewStatus(data.order.status); // (Cập nhật lại newStatus)
      toast.success(data.message);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageTitle}>Đang tải chi tiết đơn hàng...</div>
    );
  }
  if (!order) {
    return <div className={styles.pageTitle}>Không tìm thấy đơn hàng.</div>;
  }

  // (Phần tính toán numTotal, subtotal giữ nguyên)
  const numTotal = Number(order.total);
  const numDiscount = Number(order.discount_amount || 0);
  const numCoinDiscount = Number(order.coin_discount_amount || 0);
  const subtotal = numTotal + numDiscount + numCoinDiscount;

  return (
    <div>
      <Link href="/orders" className={styles.backButton}>
        <FiArrowLeft /> Quay lại danh sách
      </Link>

      {/* (Toàn bộ phần JSX bên dưới giữ nguyên y hệt) */}
      <div className={detailStyles.header}>
        <h1 className={styles.pageTitle}>
          Chi tiết Đơn hàng: {order.order_code}
        </h1>
        <div className={detailStyles.statusBox}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className={detailStyles.statusSelect}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {order.status === "pending_recipient" && (
              <option value="pending_recipient">Chờ nhận quà</option>
            )}
            {order.status === "pending_payment" && (
              <option value="pending_payment">Chờ thanh toán</option>
            )}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || newStatus === order.status}
            className={detailStyles.updateButton}
          >
            {isUpdating ? "Đang lưu..." : "Cập nhật"}
          </button>
        </div>
      </div>

      <div className={detailStyles.layoutGrid}>
        <div className={detailStyles.leftColumn}>
          <div className={detailStyles.card}>
            <h3 className={detailStyles.cardTitle}>
              <FiPackage /> Sản phẩm
            </h3>
            {order.items.map((item) => (
              <div key={item.product_id} className={detailStyles.itemRow}>
                <Image
                  src={
                    (item.image_url && item.image_url[0]) || "/placeholder.png"
                  }
                  alt={item.name}
                  width={50}
                  height={50}
                  className={detailStyles.itemImage}
                />
                <div className={detailStyles.itemInfo}>
                  <span className={detailStyles.itemName}>{item.name}</span>
                  <span className={detailStyles.itemQty}>
                    {Number(item.price).toLocaleString("vi-VN")} ₫ x{" "}
                    {item.quantity}
                  </span>
                </div>
                <span className={detailStyles.itemTotal}>
                  {(Number(item.price) * item.quantity).toLocaleString("vi-VN")}{" "}
                  ₫
                </span>
              </div>
            ))}
            <div className={detailStyles.costSummary}>
              <div className={detailStyles.costRow}>
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")} ₫</span>
              </div>

              {numDiscount > 0 && (
                <div
                  className={`${detailStyles.costRow} ${detailStyles.discount}`}
                >
                  <span>Giảm giá Voucher</span>
                  <span>- {numDiscount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
              {numCoinDiscount > 0 && (
                <div
                  className={`${detailStyles.costRow} ${detailStyles.discount}`}
                >
                  <span>Giảm giá Xu</span>
                  <span>- {numCoinDiscount.toLocaleString("vi-VN")} ₫</span>
                </div>
              )}
              <div
                className={`${detailStyles.costRow} ${detailStyles.grandTotal}`}
              >
                <span>Tổng cộng</span>
                <span>{numTotal.toLocaleString("vi-VN")} ₫</span>
              </div>
            </div>
          </div>

          <div className={detailStyles.card}>
            <h3 className={detailStyles.cardTitle}>
              <FiDollarSign /> Thanh toán
            </h3>
            <p className={detailStyles.paymentMethod}>
              Phương thức: <span>{order.payment_method}</span>
            </p>
            <p className={detailStyles.paymentStatus}>
              Trạng thái: <span>{order.status}</span>
            </p>
          </div>
        </div>

        <div className={detailStyles.rightColumn}>
          {order.is_digital_gift ? (
            <div className={detailStyles.card}>
              <h3 className={detailStyles.cardTitle}>
                <FiGift /> Thông tin Quà Tặng Tức Thì
              </h3>
              <p>
                <strong>Người nhận:</strong> {order.recipient_name}
              </p>
              <p>
                <strong>Email nhận:</strong> {order.recipient_email}
              </p>
              <p>
                <strong>Lời nhắn:</strong> "{order.recipient_message}"
              </p>
              <hr className={detailStyles.divider} />
              {order.shipping_address ? (
                <>
                  <p>
                    <strong>Địa chỉ người nhận đã điền:</strong>
                  </p>
                  <p>{order.shipping_address}</p>
                  <p>
                    <strong>SĐT:</strong> {order.phone_number}
                  </p>
                </>
              ) : (
                <p className={detailStyles.pending}>
                  Người nhận chưa điền địa chỉ.
                </p>
              )}
            </div>
          ) : (
            <div className={detailStyles.card}>
              <h3 className={detailStyles.cardTitle}>
                <FiTruck /> Thông tin Giao hàng
              </h3>
              <p>
                <strong>{order.full_name}</strong>
              </p>
              <p>{order.shipping_address}</p>
              <p>
                <strong>SĐT:</strong> {order.phone_number}
              </p>
            </div>
          )}
          <div className={detailStyles.card}>
            <h3 className={detailStyles.cardTitle}>
              <FiUser /> Khách hàng (Người đặt)
            </h3>
            <p>
              <strong>{order.user_name}</strong>
            </p>
            <p>{order.user_email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
