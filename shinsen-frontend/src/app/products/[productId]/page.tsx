import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

// Dùng link trực tiếp để tránh mọi sai sót về biến môi trường
const API_URL = "https://shinsen-backend-api.onrender.com";

async function getProductById(id: string) {
  try {
    // Xử lý ID: loại bỏ "product-" nếu có
    const numericId = id.includes("product-") ? id.replace("product-", "") : id;

    console.log("Fetching data for numericId:", numericId);

    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Backend returned error status:", res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = params;

  // Gọi hàm lấy dữ liệu
  const product = await getProductById(productId);

  // Nếu không lấy được sản phẩm, hiện thông báo thay vì 404 để dễ debug
  if (!product) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Không tìm thấy dữ liệu cho ID: {productId}</h2>
        <p>
          Vui lòng kiểm tra xem Backend trên Render đã có sản phẩm này chưa.
        </p>
        <Link
          href="/products"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
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
