"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import styles from "./ProductDetailPage.module.css";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import StarRating from "@/components/StarRating";
import ReviewForm from "@/components/ReviewForm";
import { toast } from "react-hot-toast";
// --- ĐỊNH NGHĨA CÁC KIỂU DỮ LIỆU ---
interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  introduction: string;
  price: number;
  image_url: string[] | null;
  category: string;
  is_available: boolean;
  discount_price?: number;
  time_delivery: string | null;
  policy: string | null;
  promotion: string | null;
  care_instructions: string | null;
  specs_info: string | null;
}
interface ProductDetailClientProps {
  product: Product;
}

const DEFAULT_IMAGE = "/placeholder.png";

// --- COMPONENT CHÍNH ---
export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { isAuthenticated, token } = useAuth();
  const images =
    product.image_url && product.image_url.length > 0
      ? product.image_url
      : [DEFAULT_IMAGE];

  // States cho component
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // --- HÀM FETCH DỮ LIỆU ---
  const fetchReviews = async () => {
    if (!product.id) return;
    try {
      setIsLoadingReviews(true);
      const res = await fetch(`/api/reviews/${product.id}`); // Sửa lại để dùng relative path
      if (!res.ok) {
        throw new Error("Không thể tải dữ liệu đánh giá.");
      }
      const data: Review[] = await res.json();
      setReviews(data);

      if (data.length > 0) {
        const totalRating = data.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        setAverageRating(totalRating / data.length);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleReviewSubmit = async (review: {
    rating: number;
    comment: string;
  }) => {
    if (!token) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      return;
    }
    try {
      const res = await fetch("/api/reviews", {
        // Sửa lại để dùng relative path
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: review.rating,
          comment: review.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gửi đánh giá thất bại.");
      }
      toast.success("Cảm ơn bạn đã gửi đánh giá!");
      fetchReviews();
    } catch (error: any) {
      console.error("Lỗi khi gửi review:", error);
      toast.error(`Đã có lỗi xảy ra: ${error.message}`);
    }
  };

  // === BẮT ĐẦU SỬA LỖI THÊM VÀO GIỎ HÀNG ===
  const handleAddToCart = async () => {
    try {
      // Sửa ở đây: chỉ truyền product.id, không phải cả object product
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error(`Thêm sản phẩm thất bại: ${error.message}`);
    }
  };
  // === KẾT THÚC SỬA LỖI ===

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const formatText = (text: string | null | undefined): string => {
    if (!text) return "";
    return text.replace(/\\n/g, "\n");
  };

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

  // --- GIAO DIỆN RENDER ---
  return (
    <div className={styles.container}>
      <div className={styles.productGrid}>
        {/* === CỘT HÌNH ẢNH === */}
        <div className={styles.imageColumn}>
          <div className={styles.mainImageWrapper}>
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className={`${styles.navArrow} ${styles.prevArrow}`}
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className={`${styles.navArrow} ${styles.nextArrow}`}
                  aria-label="Next image"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          <div className={styles.thumbnailGrid}>
            {images.map((img, index) => (
              <div
                key={index}
                className={`${styles.thumbnailWrapper} ${
                  currentImageIndex === index ? styles.thumbnailActive : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded"
                  sizes="100px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* === CỘT THÔNG TIN SẢN PHẨM === */}
        <div className={styles.infoColumn}>
          <p className={styles.category}>{product.category}</p>
          <h1 className={styles.productName}>{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={averageRating} />
            {reviews.length > 0 && (
              <span className="text-gray-500">({reviews.length} đánh giá)</span>
            )}
          </div>
          <div className={styles.priceSection}>
            {product.discount_price &&
            Number(product.discount_price) < Number(product.price) ? (
              <>
                <p className={styles.salePrice}>
                  {Number(product.discount_price).toLocaleString("vi-VN")} ₫
                </p>
                <p className={styles.originalPrice}>
                  {Number(product.price).toLocaleString("vi-VN")} ₫
                </p>
                {discountPercent > 0 && (
                  <span className={styles.discountBadge}>
                    -{discountPercent}%
                  </span>
                )}
              </>
            ) : (
              <p className={styles.salePrice}>
                {Number(product.price).toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>
          <div className={styles.status}>
            {product.is_available ? (
              <span className={styles.statusAvailable}>
                <FiCheckCircle /> Còn hàng
              </span>
            ) : (
              <span className={styles.statusUnavailable}>
                <FiXCircle /> Hết hàng
              </span>
            )}
          </div>
          <div className={styles.introductionSection}>
                        <p>{product.introduction}            </p> 
          </div>
          <div className={styles.actionSection}>
            <div className={styles.quantitySelector}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={styles.quantityButton}
              >
                <FiMinus />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className={styles.quantityButton}
              >
                <FiPlus />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
              disabled={!product.is_available}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* === PHẦN THÔNG TIN THÊM VÀ ĐÁNH GIÁ === */}
      <div className={styles.extraInfoGrid}>
        {/* --- 1. MÔ TẢ SẢN PHẨM (từ description) --- */}
        {product.description && (
          <div>
            <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
            <p className="whitespace-pre-line">
              {formatText(product.description)}
            </p>
          </div>
        )}

        {/* --- 2. THÔNG SỐ & CHẤT LIỆU (từ specs_info) --- */}
        {product.specs_info && (
          /* ĐÃ THÊM: className="mt-8" để tạo khoảng cách (xuống dòng) */
          <div className={product.description ? "mt-8" : ""}>
            <h2 className={styles.sectionTitle}>Thông số & Chất liệu</h2>
            <p className="whitespace-pre-line">
              {formatText(product.specs_info)}
            </p>
          </div>
        )}

        {/* --- 3. GIAO HÀNG & ĐỔI TRẢ (từ time_delivery và policy) --- */}
        {(product.time_delivery || product.policy) && (
          /* ĐÃ THÊM: className="mt-8" để tạo khoảng cách */
          <div
            className={product.specs_info || product.description ? "mt-8" : ""}
          >
            <h2 className={styles.sectionTitle}>Giao hàng & Đổi trả</h2>
            {product.time_delivery && (
              <>
                <h3 className={styles.subSectionTitle}>Thời gian giao hàng</h3>
                <p className="whitespace-pre-line">
                  {formatText(product.time_delivery)}
                </p>
              </>
            )}
            {product.policy && (
              <div className={product.time_delivery ? "mt-4" : ""}>
                <h3 className={styles.subSectionTitle}>Chính sách đổi trả</h3>
                <p className="whitespace-pre-line">
                  {formatText(product.policy)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- 4. HƯỚNG DẪN BẢO QUẢN (từ care_instructions) --- */}
        {product.care_instructions && (
          /* ĐÃ THÊM: className="mt-8" để tạo khoảng cách */
          <div
            className={
              product.specs_info ||
              product.time_delivery ||
              product.policy ||
              product.description
                ? "mt-8"
                : ""
            }
          >
            <h2 className={styles.sectionTitle}>Lưu ý sử dụng</h2>
            <p className="whitespace-pre-line">
              {formatText(product.care_instructions)}
            </p>
          </div>
        )}
      </div>

      <div id="review-form" className="mt-12">
        {" "}
        <h2 className={styles.sectionTitle}>Đánh giá sản phẩm</h2>
        <div className="my-8">
          {isAuthenticated ? (
            <ReviewForm productId={product.id} onSubmit={handleReviewSubmit} />
          ) : (
            <p className="text-center bg-gray-100 p-4 rounded-md">
              Vui lòng{" "}
              <a
                href="/login"
                className="font-bold text-green-600 hover:underline"
              >
                đăng nhập
              </a>{" "}
              để viết đánh giá.
            </p>
          )}
        </div>
        <div className={styles.reviewsListContainer}>
          {isLoadingReviews ? (
            <p>Đang tải đánh giá...</p>
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <StarRating rating={review.rating} />
                  <p className={styles.reviewAuthor}>{review.user_name}</p>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
                <p className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))
          ) : (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
        </div>
      </div>
    </div>
  );
}
