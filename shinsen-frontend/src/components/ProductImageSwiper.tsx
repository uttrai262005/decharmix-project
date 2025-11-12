// File: src/components/ProductImageSwiper.tsx
"use client";

import React from "react";
import Image from "next/image";

// Import các thành phần của Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// === IMPORT 2 DÒNG CSS NÀY (CỰC KỲ QUAN TRỌNG) ===
import "swiper/css";
import "swiper/css/navigation";
// =================================================

interface ProductImageSwiperProps {
  images: string[];
  productName: string;
}

const ProductImageSwiper = ({
  images,
  productName,
}: ProductImageSwiperProps) => {
  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      navigation={true}
      autoplay={{
        delay: 2500, // Tăng nhẹ thời gian để người dùng kịp xem
        disableOnInteraction: false,
      }}
      loop={true}
      className="product-card-swiper" // Class để tùy chỉnh CSS mũi tên
    >
      {images.map((imgUrl, index) => (
        <SwiperSlide key={index}>
          <Image
            src={imgUrl}
            alt={`${productName} - ảnh ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="transition-transform duration-500 group-hover:scale-110"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProductImageSwiper;
