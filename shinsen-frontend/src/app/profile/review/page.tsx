"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ReviewPage.module.css"; // (Chúng ta sẽ tạo file này ở Bước 3)

// Interface (sao chép từ các file khác)
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image_url: string[] | null;
  // QUAN TRỌNG: API của bạn cần trả về product_id
  product_id: number;
}
interface Order {
  id: number;
  order_code: string;
  status: string;
  items: OrderItem[];
}

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();

  const orderId = searchParams.get("order_id"); // Lấy order_id từ URL

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !orderId) {
      router.push("/login"); // Nếu không có token hoặc orderId, đẩy về login
      return;
    }

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Gọi API ta đã làm ở bước trước
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error("Không thể tải chi tiết đơn hàng.");
        }
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token, router]);

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
    return (
      <div className={styles.message}>Đang tải sản phẩm cần đánh giá...</div>
    );
  }

  if (!order || !order.items || order.items.length === 0) {
    return (
      <div className={styles.message}>
        Không tìm thấy sản phẩm trong đơn hàng này.
      </div>
    );
  }

  return (
    <div className={styles.reviewWrapper}>
      <h1 className={styles.title}>Đánh giá sản phẩm</h1>
      <p className={styles.subtitle}>
        Bạn đang đánh giá các sản phẩm trong đơn hàng{" "}
        <strong>#{order.order_code}</strong>
      </p>

      <div className={styles.itemsList}>
        {order.items.map((item) => (
          <div key={item.product_id} className={styles.itemCard}>
            <div className={styles.itemImage}>
              <Image
                src={getFirstImage(item.image_url)}
                alt={item.name}
                width={80}
                height={80}
              />
            </div>
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemNote}>Bạn thấy sản phẩm này thế nào?</p>
            </div>
            {/* Nút này sẽ link đến /products/product-123 VÀ cuộn xuống #review-form
              mà chúng ta đã thêm ở Bước 1
            */}
            <Link
              href={`/products/product-${item.product_id}#review-form`}
              className={styles.reviewButton}
              target="_blank" // Mở tab mới để đánh giá
              rel="noopener noreferrer"
            >
              Viết đánh giá
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
