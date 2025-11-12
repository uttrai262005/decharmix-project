"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react"; // Thêm import nếu cần
import AnimatedBackground from "@/components/AnimatedBackground"; // Import component mới

// Component HomePage bây giờ là export default duy nhất
export default function HomePage() {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "backOut", delay: 0.8 },
    },
    hover: { scale: 1.05, boxShadow: "0 0 25px rgba(22, 163, 74, 0.6)" },
    tap: { scale: 0.95 },
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Lớp 1: Nền và các hiệu ứng trang trí */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-background.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Gọi component hiệu ứng đã tách ra */}
      <AnimatedBackground />

      {/* Lớp 2: Nội dung chính */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          Chào mừng đến với Shinsen!
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl max-w-2xl mb-8 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={{
            ...textVariants,
            visible: {
              ...textVariants.visible,
              transition: { ...textVariants.visible.transition, delay: 0.4 },
            },
          }}
        >
          Nông sản tươi ngon & Hải sản cao cấp từ trang trại, đến bàn ăn.
        </motion.p>

        <Link href="/products">
          <motion.div
            className="px-10 py-4 bg-green-600 text-white font-bold rounded-full shadow-xl hover:bg-green-700 transition-colors duration-300 cursor-pointer"
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Mua sắm ngay
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
