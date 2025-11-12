"use client";
import { toast } from "react-hot-toast";
import { useCart, CartItem } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import styles from "./CartPage.module.css"; // Đảm bảo bạn đã tạo file CSS này

// Component chính cho trang giỏ hàng
export default function CartPage() {
  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart,
    cartTotal,
    itemCount,
  } = useCart();

  // Hiển thị thông báo khi đang tải dữ liệu
  if (loading) {
    return <div className={styles.centeredMessage}>Đang tải giỏ hàng...</div>;
  }

  // Hiển thị khi giỏ hàng trống
  if (!loading && cartItems.length === 0) {
    return (
      <div className={styles.centeredMessage}>
        <p>Giỏ hàng của bạn đang trống.</p>
        <button>
          <Link href="/products" className={styles.continueShopping}>
            Tiếp tục mua sắm
          </Link>
        </button>
      </div>
    );
  }

  // Giao diện chính của giỏ hàng khi có sản phẩm
  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>
        Giỏ hàng của bạn ({itemCount} sản phẩm)
      </h1>
      <div className={styles.mainLayout}>
        {/* Cột danh sách sản phẩm */}
        <div className={styles.itemsList}>
          {cartItems.map((item) => (
            <CartItemRow
              key={item.product_id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Cột tóm tắt đơn hàng */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Tóm tắt đơn hàng</h2>
          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <span>{cartTotal.toLocaleString("vi-VN")} ₫</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Tổng cộng</span>
            <span>{cartTotal.toLocaleString("vi-VN")} ₫</span>
          </div>
          <Link href="/checkout" className={styles.checkoutButton}>
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT CON CHO MỖI DÒNG SẢN PHẨM ---
// (Đã bao gồm logic sửa lỗi cho các nút bấm)
const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}) => {
  const price = item.discount_price || item.price;

  // Hàm xử lý an toàn khi cập nhật số lượng
  const handleUpdate = async (newQuantity: number) => {
    try {
      await onUpdateQuantity(item.product_id, newQuantity);
      // Bạn cũng nên thêm toast.success ở đây nếu muốn
      // toast.success("Cập nhật số lượng thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      // SỬA Ở ĐÂY: Phải là toast.error
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  // Hàm xử lý an toàn khi xóa sản phẩm
  const handleRemove = async () => {
    if (confirm(`Bạn có chắc muốn xóa "${item.name}" khỏi giỏ hàng?`)) {
      try {
        await onRemove(item.product_id);
        // NÊN THÊM: Thông báo thành công khi xóa
        toast.success(`Đã xóa "${item.name}" khỏi giỏ hàng.`);
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        // SỬA Ở ĐÂY: Phải là toast.error
        toast.error("Xóa sản phẩm thất bại, vui lòng thử lại.");
      }
    }
  };

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemInfo}>
        <div className={styles.itemImageWrapper}>
          <Image
            src={item.image_url || "/placeholder.png"}
            alt={item.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div>
          <p className={styles.itemName}>{item.name}</p>
          <p className={styles.itemPrice}>{price.toLocaleString("vi-VN")} ₫</p>
        </div>
      </div>
      <div className={styles.itemActions}>
        <div className={styles.quantitySelector}>
          <button onClick={() => handleUpdate(item.quantity - 1)}>
            <FiMinus />
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => handleUpdate(item.quantity + 1)}>
            <FiPlus />
          </button>
        </div>
        <p className={styles.itemSubtotal}>
          {(price * item.quantity).toLocaleString("vi-VN")} ₫
        </p>
        <button className={styles.removeButton} onClick={handleRemove}>
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};
