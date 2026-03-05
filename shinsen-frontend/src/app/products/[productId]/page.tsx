import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

// Dán cứng link Render để không bao giờ bị lỗi biến môi trường undefined
const API_URL = "https://shinsen-backend-api.onrender.com";

async function getProductById(id: string) {
  try {
    // Xử lý thông minh: lấy số từ "product-1" hoặc dùng luôn nếu là "1"
    const numericId = id.includes("product-") ? id.replace("product-", "") : id;

    console.log("Đang gọi API cho ID:", numericId);

    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.error("API trả về lỗi:", res.status);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Lỗi kết nối đến Render:", error);
    return null;
  }
}

// QUAN TRỌNG: Tên biến productId phải khớp với tên thư mục [productId]
export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  // Đợi params được giải nén (cần thiết cho Next.js bản mới)
  const { productId } = params;

  if (!productId) {
    return notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    return notFound();
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Link href="/products" className={styles.backLink}>
            <FiChevronLeft className="mr-2" />
            Quay lại tất cả sản phẩm
          </Link>
          {/* Truyền dữ liệu sang file ProductDetailClient.tsx */}
          <ProductDetailClient product={product} />
        </div>
      </main>
    </div>
  );
}
