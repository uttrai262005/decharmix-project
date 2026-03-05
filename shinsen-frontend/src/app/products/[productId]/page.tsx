import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css";

const API_URL = "https://shinsen-backend-api.onrender.com";

async function getProductById(id: string) {
  try {
    // Logic bóc tách số cực mạnh: nó sẽ lấy tất cả các chữ số có trong chuỗi
    // Ví dụ: "product-1" -> "1", "1" -> "1"
    const numericId = id.replace(/\D/g, "");

    console.log("Đang gọi API Render với ID số:", numericId);

    const res = await fetch(`${API_URL}/api/products/${numericId}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Lưu ý: Nếu Backend trả về dạng { product: {...} } thì phải lấy đúng
    // Nhưng dựa trên dữ liệu bạn gửi, nó trả về trực tiếp Object sản phẩm hoặc Array
    return data;
  } catch (error) {
    console.error("Lỗi fetch:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = params;
  const product = await getProductById(productId);

  if (!product) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <p>
          ID nhận được từ URL: <strong>{productId}</strong>
        </p>
        <p>Vui lòng kiểm tra lại ID trong Database.</p>
        <Link
          href="/products"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <Link href="/products" className={styles.backLink}>
            <FiChevronLeft className="mr-2" /> Quay lại tất cả sản phẩm
          </Link>
          <ProductDetailClient product={product} />
        </div>
      </main>
    </div>
  );
}
