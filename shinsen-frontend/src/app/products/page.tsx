"use client";
import { toast } from "react-hot-toast";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus, FiStar } from "react-icons/fi";
import Image from "next/image";
import Slider from "rc-slider";
import Link from "next/link";
import ProductImageSwiper from "@/components/ProductImageSwiper";
import { useCart } from "@/contexts/CartContext";
import styles from "./ProductsPage.module.css";
import StarRating from "@/components/StarRating";

// === SỬA LỖI 1: CẬP NHẬT INTERFACE ===
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string[] | null; // An toàn hơn khi cho phép null
  discount_price?: number;
  // unit?: string; // Xóa trường "unit" của nông sản
  average_rating: number;
  review_count: number;
}
// ===================================
const categories = [
  "TẤT CẢ",
  "PHỤ KIỆN ĐIỆN THOẠI",
  "VÒNG TAY",
  "COMBO QUÀ TẶNG",
  "PHỤ KIỆN GÓI QUÀ",
  "DÂY CHUYỀN",
  "PHỤ KIỆN TÓC",
];
const sortOptions = [
  "Mới nhất",
  "Giá: Thấp đến cao",
  "Giá: Cao đến thấp",
  "Đánh giá cao",
];

// --- Component Card Sản phẩm (Không đổi) ---
const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const calculateDiscountPercent = (
    originalPrice: number,
    discountPrice: number
  ) => {
    if (!discountPrice || discountPrice >= originalPrice) return 0;
    const discount = ((originalPrice - discountPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  const discountPercent = product.discount_price
    ? calculateDiscountPercent(
        Number(product.price),
        Number(product.discount_price)
      )
    : 0;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error("Thêm sản phẩm thất bại, vui lòng thử lại.");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      className={styles.productCard}
    >
      <Link
        href={`/products/product-${product.id}`}
        className="flex flex-col flex-grow"
      >
        {discountPercent > 0 && (
          <div className={styles.saleBadge}>GIẢM {discountPercent}%</div>
        )}

        <div className={styles.productImageWrapper}>
          {product.image_url && product.image_url.length > 1 ? (
            <ProductImageSwiper
              images={product.image_url}
              productName={product.name}
            />
          ) : (
            product.image_url &&
            product.image_url[0] && (
              <Image
                src={product.image_url[0]}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className={styles.productImage}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )
          )}
        </div>

        <div className={styles.productContent}>
          <p className={styles.productCategory}>{product.category}</p>
          <h3 className={styles.productName}>{product.name}</h3>
          
          <div className={styles.priceContainer}>
            {product.discount_price &&
            Number(product.discount_price) < Number(product.price) ? (
              <>
                <p className={styles.salePrice}>
                  {Number(product.discount_price).toLocaleString("vi-VN")} ₫
                </p>
                <p className={styles.originalPrice}>
                  {Number(product.price).toLocaleString("vi-VN")} ₫
                </p>
              </>
            ) : (
              <p className={styles.productPrice}>
                {Number(product.price).toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>

{/* 3. GOM NHÓM MỚI: Rating + Số lượng nằm ngang hàng */}
  <div className={styles.metaRow}>
    {/* Rating nằm bên trái */}
    <div className={styles.ratingContainer}>
      <StarRating rating={Number(product.average_rating) || 0} />
      {product.review_count > 0 && (
        <p className={styles.reviewCount}>({product.review_count})</p>
      )}
    </div>

    {/* Số lượng nằm bên phải (Đưa vào trong metaRow) */}
    <div className={styles.quantitySelector} onClick={handleActionClick}>
      <button
        className={styles.quantityButton}
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      >
        <FiMinus />
      </button>
      <span className={styles.quantityDisplay}>{quantity}</span>
      <button
        className={styles.quantityButton}
        onClick={() => setQuantity((q) => q + 1)}
      >
        <FiPlus />
      </button>
    </div>
  </div>

  {/* 4. Nút Thêm vào giỏ (Giữ nguyên ở dưới cùng) */}
  <div className={styles.actionsContainer} onClick={handleActionClick}>
    <button className={styles.addToCartButton} onClick={handleAddToCart}>
      Thêm vào giỏ hàng
    </button>
  </div>
        </div>
      </Link>
    </motion.div>
  );
};

// --- Component Chính Trang Sản Phẩm ---
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "Tất cả",
    priceRange: [0, 1000000],
    sortBy: "Mới nhất",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...(products || [])];

    result = result
      .filter(
        (p) => filters.category === "Tất cả" || p.category === filters.category
      )
      .filter(
        (p) =>
          (p.discount_price || p.price) >= filters.priceRange[0] &&
          (p.discount_price || p.price) <= filters.priceRange[1]
      );

    switch (filters.sortBy) {
      case "Giá: Thấp đến cao":
        result.sort(
          (a, b) =>
            (a.discount_price || a.price) - (b.discount_price || b.price)
        );
        break;
      case "Giá: Cao đến thấp":
        result.sort(
          (a, b) =>
            (b.discount_price || b.price) - (a.discount_price || a.price)
        );
        break;
      case "Đánh giá cao":
        result.sort((a, b) => b.average_rating - a.average_rating);
        break;
      default: // Mới nhất
        result.sort((a, b) => a.id - b.id);
        break;
    }
    return result;
  }, [products, filters]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage
  );
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <main>
        {/* === SỬA LỖI 2: CẬP NHẬT HERO SECTION === */}
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Phụ Kiện Handmade</h1>
          <p className={styles.heroSubtitle}>
            Khám phá các sản phẩm độc đáo từ Decharmix
          </p>
        </section>
        {/* ======================================= */}

        <section className={styles.mainContent}>
          <div className={styles.gridContainer}>
            <aside className={styles.filtersAside}>
              <h2 className={styles.filtersTitle}>Bộ lọc</h2>
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>Danh mục</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilters((f) => ({ ...f, category: cat }));
                        setCurrentPage(1);
                      }}
                      className={`${styles.categoryButton} ${
                        filters.category === cat
                          ? styles.categoryButtonActive
                          : ""
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupTitle}>Khoảng giá</h3>
                <Slider
                  range
                  min={0}
                  max={500000} // Giảm max price cho phù hợp
                  step={10000} // Bước nhảy nhỏ hơn
                  defaultValue={[0, 500000]}
                  onChange={(value) => {
                    setFilters((f) => ({
                      ...f,
                      priceRange: value as number[],
                    }));
                    setCurrentPage(1);
                  }}
                />
                <div className={styles.priceRangeDisplay}>
                  <span>{filters.priceRange[0].toLocaleString()}₫</span>
                  <span>{filters.priceRange[1].toLocaleString()}₫</span>
                </div>
              </div>
            </aside>
            <div className={styles.productsColumn}>
              <div className={styles.topBar}>
                <p className={styles.productCount}>
                  Hiển thị {paginatedProducts.length} trên{" "}
                  {filteredAndSortedProducts.length} sản phẩm
                </p>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, sortBy: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className={styles.sortSelect}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {paginatedProducts.length > 0 ? (
                <motion.div layout className={styles.productsGrid}>
                  <AnimatePresence>
                    {paginatedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className={styles.noProductsFound}>
                  <p>Không tìm thấy sản phẩm phù hợp.</p>
                </div>
              )}
              <div className={styles.pagination}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`${styles.pageButton} ${
                      currentPage === i + 1 ? styles.pageButtonActive : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
