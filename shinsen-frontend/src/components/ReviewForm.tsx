"use client";

import { useState } from "react";
import { FiStar } from "react-icons/fi";
// Import CSS module của ProductDetailPage để dùng các class chung
import styles from "../app/products/[productId]/ProductDetailPage.module.css";
import { toast } from "react-hot-toast";
interface ReviewFormProps {
  productId: number;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

const ReviewForm = ({ productId, onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá.");
      return;
    }
    onSubmit({ rating, comment });
    setRating(0); // Reset rating sau khi gửi
    setComment(""); // Reset comment sau khi gửi
  };

  return (
    // Dùng class từ CSS module
    <form onSubmit={handleSubmit} className={styles.reviewFormContainer}>
      <h3 className={styles.reviewFormTitle}>Viết đánh giá của bạn</h3>

      <div className={styles.starContainer}>
        <p className={styles.reviewFormLabel}>
          Bạn đánh giá sản phẩm này thế nào?
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
              <label key={starValue} className={styles.starLabel}>
                <input
                  type="radio"
                  name="rating"
                  value={starValue}
                  onClick={() => setRating(starValue)}
                  style={{ display: "none" }} // Ẩn input radio mặc định
                />
                <FiStar
                  size={28}
                  // SỬA Ở ĐÂY: Dùng inline style cho màu xanh của sao
                  style={{
                    color:
                      (hoverRating || rating) >= starValue
                        ? "#fe98bf"
                        : "#d1d5db" /* Màu xanh lá và xám */,
                    fill:
                      (hoverRating || rating) >= starValue ? "#fe98bf" : "none",
                    transition: "color 0.2s ease-in-out",
                  }}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="comment" className={styles.reviewFormLabel}>
          Bình luận của bạn
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Sản phẩm rất tuyệt vời..."
          className={styles.reviewFormTextarea} // Dùng class từ CSS module
        />
      </div>

      <button type="submit" className={styles.reviewSubmitButton}>
        Gửi đánh giá
      </button>
    </form>
  );
};

export default ReviewForm;
