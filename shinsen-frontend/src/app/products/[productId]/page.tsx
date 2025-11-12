import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";
import ProductDetailClient from "./ProductDetailClient";
import styles from "./ProductDetailPage.module.css"; // Import file CSS mới
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProductById(productId: number) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (error) {
    console.error("Supabase error fetching product:", error.message);
    return null;
  }
  return data;
}

// (Hàm getRelatedProducts không thay đổi)

type ProductDetailPageProps = {
  params: { productId: string };
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const productId = parseInt(params.productId.replace("product-", ""), 10);

  if (isNaN(productId)) {
    notFound();
  }

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // const relatedProducts = await getRelatedProducts(product.category, product.id);

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
        {/* Phần sản phẩm liên quan có thể thêm ở đây */}
      </main>
    </div>
  );
}
