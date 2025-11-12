"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import styles from "./GameHub.module.css"; // Chúng ta sẽ tạo file này ở Bước 2

// Danh sách tất cả 7 game của bạn
const gameHubList = [
  {
    title: "Vòng Quay May Mắn",
    description: "Quay liền tay, rinh ngay Xu và voucher giảm giá!",
    imageUrl: "/game-banner-lucky-wheel.jpg",
    href: "/game/lucky-wheel",
  },
  {
    title: "Đập Hộp Quà",
    description: "Mở hộp quà bí ẩn, 100% trúng thưởng độc quyền.",
    imageUrl: "/game-banner-gift-box.jpg",
    href: "/game/gift-box",
  },
  {
    title: "Lật Hình Trí Nhớ",
    description: "Thử thách trí nhớ, thắng game trong 60s nhận thưởng!",
    imageUrl: "/game-banner-memory-match.jpg",
    href: "/game/memory-match",
  },
  {
    title: "Săn Charm Nhanh Tay",
    description: "Click 15 charm trong 30s. Cẩn thận bom!",
    imageUrl: "/game-banner-whac-a-charm.jpg",
    href: "/game/whac-a-charm",
  },
  {
    title: "Charm Nhảy Vượt Ải",
    description: "Né bom, ăn 10 xu trong 45 giây để thắng!",
    imageUrl: "/game-banner-charm-jump.jpg",
    href: "/game/charm-jump",
  },
  {
    title: "Chém Charm Né Bom",
    description: "Chém 20 charm. Đừng chém bom hoặc để lỡ 3 charm!",
    imageUrl: "/game-banner-charm-slice.jpg",
    href: "/game/charm-slice",
  },
];

export default function GameHubPage() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Góc Săn Thưởng</h1>
        <p className={styles.subtitle}>
          Chơi game liền tay, nhận ngay Xu thưởng và hàng ngàn voucher
          Decharmix!
        </p>

        {/* Lưới Game */}
        <div className={styles.gameGrid}>
          {gameHubList.map((game, index) => (
            <motion.div
              key={index}
              className={styles.gameCard}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.gameImageWrapper}>
                <Image
                  src={game.imageUrl}
                  alt={game.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className={styles.gameImage}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className={styles.gameContent}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <p className={styles.gameDescription}>{game.description}</p>
                <Link
                  href={game.href}
                  className={`${styles.gameButton} ${
                    game.href === "#" ? styles.gameButtonDisabled : ""
                  }`}
                >
                  {game.href === "#" ? "Sắp ra mắt" : "Chơi Ngay"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
