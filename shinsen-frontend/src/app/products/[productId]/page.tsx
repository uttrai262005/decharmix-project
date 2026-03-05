import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";
import { notFound } from "next/navigation";

// Dán cứng link Render để tránh lỗi biến môi trường trên Vercel
const API_URL = "https://shinsen-backend-api.onrender.com";

async function getProductById(id: string) {
  try {
    // Tách số từ chuỗi (Ví dụ: "product-1" -> "1")
    const numericId = id.replace(/\D/g, "");

    if (!numericId) return null;

    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    /**
     * LƯU Ý QUAN TRỌNG:
     * Dựa trên dữ liệu API bạn gửi, nếu data trả về có dạng { products: [...] }
     * thì mình lấy phần tử đầu tiên. Nếu trả về thẳng Object thì dùng data.
     */
    if (data.products && Array.isArray(data.products)) {
      return data.products[0];
    }

    return data;
  } catch (error) {
    console.error("Lỗi fetch sản phẩm:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  // BẮT BUỘC: Await params để lấy dữ liệu từ URL trong Next.js 15
  const resolvedParams = await params;
  const { productId } = resolvedParams;

  if (!productId) {
    return notFound();
  }

  const product = await getProductById(productId);

  // Giao diện dự phòng nếu không tìm thấy sản phẩm hoặc lỗi Backend
  if (!product) {
    return (
      <div
        style={{
          padding: "100px 20px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ color: "#e74c3c" }}>Sản phẩm không tồn tại</h2>
        <p>
          Không tìm thấy dữ liệu cho mã: <strong>{productId}</strong>
        </p>
        <p style={{ color: "#666" }}>
          Vui lòng kiểm tra lại kết nối với máy chủ Render.
        </p>
        <Link
          href="/products"
          style={{
            color: "#27ae60",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          Quay lại danh sách sản phẩm
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

          {/* Truyền dữ liệu sang Client Component */}
          <ProductDetailClient product={product} />
        </div>
      </main>
    </div>
  );
}
