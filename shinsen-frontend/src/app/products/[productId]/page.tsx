import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

// Hàm lấy dữ liệu từ Backend Render thay vì gọi trực tiếp Supabase
async function getProductById(productId: number) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://shinsen-backend-api.onrender.com";

  try {
    // Gọi đến API sản phẩm mà Backend đã cung cấp
    const res = await fetch(`${API_URL}/api/products/${productId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Lỗi fetch sản phẩm từ Render:", error);
    return null;
  }
}

type ProductDetailPageProps = {
  params: { productId: string };
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  // Xử lý ID từ format "product-1" hoặc "1"
  const rawId = params.productId.replace("product-", "");
  const productId = parseInt(rawId, 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

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
