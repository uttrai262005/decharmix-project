import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

const API_URL = "https://shinsen-backend-api.onrender.com";

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  // 1. Lấy productId từ params
  const { productId } = params;

  // 2. Gọi API đến Render (xử lý cả trường hợp productId là "product-1" hoặc "1")
  const numericId = productId.replace("product-", "");

  try {
    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return notFound(); // Trả về 404 nếu không tìm thấy sản phẩm trong database
    }

    const product = await res.json();

    return (
      <div className={styles.pageWrapper}>
        <main className={styles.mainContent}>
          <div className={styles.container}>
            <Link href="/products" className={styles.backLink}>
              <FiChevronLeft className="mr-2" />
              Quay lại tất cả sản phẩm
            </Link>
            <ProductDetailClient product={product} />
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Lỗi kết nối Render:", error);
    return <div>Máy chủ đang bận, vui lòng thử lại sau giây lát.</div>;
  }
}
