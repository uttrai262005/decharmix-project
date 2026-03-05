import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

// Dùng link trực tiếp để đảm bảo không bị lỗi biến môi trường
const API_URL = "https://shinsen-backend-api.onrender.com";

async function getProductById(id: string) {
  try {
    // Xử lý nếu ID có dạng "product-1"
    const numericId = id.replace("product-", "");

    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Lỗi fetch sản phẩm:", error);
    return null;
  }
}

// LƯU Ý: Tên biến phải khớp với tên thư mục [productId]
export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  // Kiểm tra xem params có tồn tại không để tránh sập server
  if (!params || !params.productId) {
    notFound();
  }

  const product = await getProductById(params.productId);

  if (!product) {
    notFound();
  }

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
}
