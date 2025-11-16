"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiPlus,
  FiMinus,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
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

// (Interface Product đã thêm 3 trường ML)
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
  average_rating?: number;
  review_count?: number;
  sentiment_summary?: {
    positive: number;
    negative: number;
    neutral: number;
  } | null;
}

interface ProductDetailClientProps {
  product: Product;
}

// --- Component Gợi ý (Dùng nội bộ) ---
const RelatedProductCard = ({ product }: { product: Product }) => {
  const displayPrice = product.discount_price || product.price;
  const firstImage =
    (product.image_url && product.image_url[0]) || "/placeholder.png";

  return (
    <Link href={`/products/${product.id}`} className={styles.relatedCard}>
      <div className={styles.relatedImageWrapper}>
        <Image
          src={firstImage}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="20vw"
        />
      </div>
      <div className={styles.relatedContent}>
        <h4 className={styles.relatedName}>{product.name}</h4>
        <p className={styles.relatedPrice}>
          {Number(displayPrice).toLocaleString("vi-VN")} ₫
        </p>
      </div>
    </Link>
  );
};
// ===================================

const DEFAULT_IMAGE = "/placeholder.png";
const API_URL = process.env.NEXT_PUBLIC_API_URL; // Lấy API Backend

// --- COMPONENT CHÍNH ---
export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const { isAuthenticated, token } = useAuth();
  const { addToCart } = useCart();

  const images =
    product.image_url && product.image_url.length > 0
      ? product.image_url
      : [DEFAULT_IMAGE];

  // States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(
    product.average_rating || 0
  );
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // States cho ML
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [recommendationTitle, setRecommendationTitle] =
    useState("Đang tải gợi ý...");

  // --- HÀM FETCH DỮ LIỆU ---

  // (Hàm fetchReviews đã sửa API_URL)
  const fetchReviews = async () => {
    if (!product.id || !API_URL) return;
    try {
      setIsLoadingReviews(true);
      const res = await fetch(`${API_URL}/api/reviews/${product.id}`);
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

  // (useEffect tải Reviews và Gợi ý ML Hybrid)
  useEffect(() => {
    if (!product.id || !API_URL) return;

    // 1. Tải Reviews
    fetchReviews();

    // 2. Tải Gợi ý ML (Hybrid)
    const fetchRecommendations = async () => {
      try {
        // ƯU TIÊN 1: Thử lấy "Mua cùng" (Phương án 2)
        const alsoBoughtRes = await fetch(
          `${API_URL}/api/products/${product.id}/also-bought`
        );
        if (alsoBoughtRes.ok) {
          const alsoBoughtData = await alsoBoughtRes.json();
          if (alsoBoughtData.length > 0) {
            setRecommendations(alsoBoughtData);
            setRecommendationTitle("Những người khác cũng mua");
            return; // Tìm thấy -> Dừng
          }
        }

        // DỰ PHÒNG: Nếu không tìm thấy (Cold Start), lấy "Sản phẩm liên quan" (Phương án 1)
        const relatedRes = await fetch(
          `${API_URL}/api/products/${product.id}/related`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRecommendations(relatedData);
          setRecommendationTitle("Có thể bạn cũng thích");
        } else {
          setRecommendationTitle(""); // Ẩn nếu lỗi
        }
      } catch (error) {
        console.error("Lỗi tải gợi ý:", error);
        setRecommendationTitle(""); // Ẩn nếu lỗi
      }
    };

    fetchRecommendations();
  }, [product.id]);

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

  // (Hàm handleReviewSubmit đã sửa API_URL)
  const handleReviewSubmit = async (review: {
    rating: number;
    comment: string;
  }) => {
    if (!token || !API_URL) {
      toast.error("Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
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
      // (Không cần fetchReviews() vì reviewController đã cập nhật ML)
      // (Chỉ cần thêm review mới vào đầu danh sách)
      setReviews([data, ...reviews]);
      // (Tải lại trang để thấy Sentiment Bar cập nhật)
      window.location.reload();
    } catch (error: any) {
      console.error("Lỗi khi gửi review:", error);
      toast.error(`Đã có lỗi xảy ra: ${error.message}`);
    }
  };

  // (Hàm thêm vào giỏ hàng)
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      toast.error(`Thêm sản phẩm thất bại: ${error.message}`);
    }
  };

  // (Hàm chuyển ảnh)
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // (Hàm format text)
  const formatText = (text: string | null | undefined): string => {
    if (!text) return "";
    return text.replace(/\\n/g, "\n");
  };

  // (Hàm tính giảm giá)
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

  // (Tính toán ML Sentiment)
  const sentiment = product.sentiment_summary || {
    positive: 0,
    negative: 0,
    neutral: 0,
  };
  const totalSentiments = sentiment.positive + sentiment.negative;
  const positivePercent =
    totalSentiments > 0
      ? Math.round((sentiment.positive / totalSentiments) * 100)
      : 0;

  // --- GIAO DIỆN RENDER ---
  return (
    <>
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

          {/* (Đánh giá sao) */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={averageRating} />
            {reviews.length > 0 && (
              <span className="text-gray-500">({reviews.length} đánh giá)</span>
            )}
          </div>

          {/* (Thanh ML Sentiment) */}
          {totalSentiments > 0 && (
            <div className={styles.sentimentBox}>
              <h3 className={styles.sentimentTitle}>Tóm tắt cảm xúc</h3>
              <div className={styles.sentimentBar}>
                <div
                  className={styles.sentimentPositive}
                  style={{ width: `${positivePercent}%` }}
                  title={`Tích cực: ${sentiment.positive}`}
                >
                  {positivePercent > 10 && `${positivePercent}%`}
                </div>
                <div
                  className={styles.sentimentNegative}
                  style={{ width: `${100 - positivePercent}%` }}
                  title={`Tiêu cực: ${sentiment.negative}`}
                >
                  {positivePercent < 90 && `${100 - positivePercent}%`}
                </div>
              </div>
            </div>
          )}

          {/* (Giá) */}
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

          {/* (Trạng thái) */}
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

          {/* (Giới thiệu) */}
          <div className={styles.introductionSection}>
            <p>{product.introduction}</p>
          </div>

          {/* (Hành động) */}
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
              <FiShoppingCart />
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      </div>

      {/* === PHẦN THÔNG TIN THÊM (TABS) === */}
      <div className={styles.extraInfoGrid}>
        {product.description && (
          <div>
            <h2 className={styles.sectionTitle}>Mô tả sản phẩm</h2>
            <p className="whitespace-pre-line">
              {formatText(product.description)}
            </p>
          </div>
        )}
        {product.specs_info && (
          <div className={product.description ? "mt-8" : ""}>
            <h2 className={styles.sectionTitle}>Thông số & Chất liệu</h2>
            <p className="whitespace-pre-line">
              {formatText(product.specs_info)}
            </p>
          </div>
        )}
        {(product.time_delivery || product.policy) && (
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
        {product.care_instructions && (
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

      {/* === PHẦN REVIEW === */}
      <div id="review-form" className="mt-12">
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

      {/* === PHẦN GỢI Ý ML (HYBRID) === */}
      {recommendations.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>{recommendationTitle}</h2>
          <div className={styles.relatedGrid}>
            {recommendations.map((product) => (
              <RelatedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
