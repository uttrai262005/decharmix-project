// File: src/components/StarRating.tsx
"use client";

import { FiStar } from "react-icons/fi";

interface StarRatingProps {
  rating: number;
  totalStars?: number;
}

const StarRating = ({ rating, totalStars = 5 }: StarRatingProps) => {
  // Đảm bảo rating là một số hợp lệ, nếu không thì coi như là 0
  const validRating = isNaN(rating) ? 0 : rating;

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;

        // SỬA LỖI Ở ĐÂY: Dùng Math.round() để làm tròn số sao
        // Ví dụ: 3.66 sẽ được làm tròn thành 4, tô màu 4 sao
        const shouldBeFilled = starValue <= Math.round(validRating);

        return (
          <FiStar
            key={index}
            size={20}
            style={{
              color: shouldBeFilled ? "#fe98bf" : "#d1d5db",
              fill: shouldBeFilled ? "#fe98bf" : "none",
              transition: "color 0.2s ease-in-out",
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
