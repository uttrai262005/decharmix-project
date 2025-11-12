"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules"; // Bỏ Navigation
import Image from "next/image";

// Import CSS của Swiper (đã ở globals.css)
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation'; // Bỏ Navigation CSS

const banners = [
  { src: "/promo-banner-1.jpg", alt: "Sale 30% off" },
  { src: "/promo-banner-2.jpg", alt: "Sale 40% off" },
  { src: "/promo-banner-3.jpg", alt: "Freeship" },
];

export default function PromoSlider() {
  return (
    // Wrapper div để kiểm soát chiều rộng nếu cần
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination]} // Bỏ Navigation
        spaceBetween={0} // Không có khoảng cách giữa các slide
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 2000, // Tự động chuyển sau 2 giây (có thể điều chỉnh 1500ms = 1.5s)
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="promo-swiper-custom" // Thêm class tùy chỉnh để styling
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index} className="relative">
            <Image
              src={banner.src}
              alt={banner.alt}
              fill // Mới
              style={{ objectFit: "cover" }} // Mới
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Thêm sizes prop (quan trọng cho hiệu suất)
            />
            {/* Đã bỏ div chứa nút "Mua sắm ngay" */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
