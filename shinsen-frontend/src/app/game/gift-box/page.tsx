"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./GiftBox.module.css";
import { FiGift, FiDatabase, FiKey, FiLoader, FiXCircle } from "react-icons/fi";
import Image from "next/image";
import { toast } from "react-hot-toast";

// === XỬ LÝ URL AN TOÀN ĐỂ TRÁNH LỖI // ===
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

type PrizeType = "xu" | "voucher" | "ticket" | "fail" | "nothing";

interface PrizeResult {
  name: string;
  type: PrizeType;
  value: string;
}

export default function GiftBoxPage() {
  const { user, token, refreshUserStats, isAuthenticated } = useAuth();

  const [boxKeys, setBoxKeys] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrizeResult | null>(null);
  const [shakingBox, setShakingBox] = useState<number | null>(null);

  // Lấy thông tin chỉ số game
  const fetchGameStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/games/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải thông tin game");
      const data = await response.json();
      setBoxKeys(data.box_keys || 0);
    } catch (error) {
      console.error("Lỗi stats:", error);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      setUserCoins(user?.coins || 0);
      fetchGameStats();
    }
  }, [isAuthenticated, token, user, fetchGameStats]);

  // Hàm mở hộp
  const handleOpenBox = async (boxIndex: number) => {
    if (boxKeys <= 0) {
      toast.error("Bạn không có đủ chìa khóa!");
      return;
    }
    if (isLoading || result || !token) return;

    setIsLoading(true);
    setShakingBox(boxIndex);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/games/open-box`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Kiểm tra JSON an toàn
      const contentType = response.headers.get("content-type");
      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error("Máy chủ đang bận, vui lòng thử lại sau.");
      }

      const data = await response.json();

      setResult({
        name: data.prize_name,
        type: data.prize_type,
        value: data.prize_value,
      });

      // Cập nhật lại chỉ số user ngay lập tức
      await refreshUserStats();
      await fetchGameStats();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setResult({ name: error.message, type: "fail", value: "0" });
    } finally {
      setShakingBox(null);
      setIsLoading(false);
    }
  };

  const playAgain = () => {
    setResult(null);
    setIsLoading(false);
  };

  const renderPrizeIcon = (type: PrizeType) => {
    switch (type) {
      case "xu":
        return <FiDatabase className={styles.prizeIcon} />;
      case "voucher":
        return <FiGift className={styles.prizeIcon} />;
      case "ticket":
        return <FiKey className={styles.prizeIcon} />;
      default:
        return <FiXCircle className={styles.prizeIcon} />;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Hộp Quà Bí Ẩn</h1>
        <p className={styles.subtitle}>
          Dùng chìa khóa của bạn để mở 1 trong 3 hộp quà và nhận thưởng!
        </p>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <FiDatabase />
            <span>Decharmix Xu:</span>
            <strong>{userCoins.toLocaleString("vi-VN")}</strong>
          </div>
          <div className={styles.statItem}>
            <FiKey />
            <span>Chìa khóa:</span>
            <strong>{boxKeys}</strong>
          </div>
        </div>

        <div className={styles.boxGrid}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`${styles.boxContainer} ${boxKeys <= 0 ? styles.disabled : ""}`}
              onClick={() => handleOpenBox(index)}
            >
              <div
                className={`
                  ${styles.giftBox} 
                  ${shakingBox === index ? styles.shaking : ""}
                  ${result ? styles.boxDisabled : ""}
                  ${result && shakingBox !== index ? styles.boxHidden : ""}
                `}
              >
                <Image
                  src="/game-gift-box.png"
                  alt="Hộp quà"
                  width={150}
                  height={150}
                  priority
                />
              </div>
            </div>
          ))}
        </div>

        {result && (
          <div className={styles.resultPopup}>
            {renderPrizeIcon(result.type)}
            <h2 className={styles.resultTitle}>
              {["fail", "nothing"].includes(result.type)
                ? "Tiếc quá!"
                : "Chúc Mừng!"}
            </h2>
            <p className={styles.resultMessage}>
              Dành cho bạn: <strong>{result.name}</strong>
            </p>
            <button onClick={playAgain} className={styles.playAgainButton}>
              Mở hộp khác
            </button>
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <FiLoader className={styles.loaderIcon} />
            <p>Đang kiểm tra chìa khóa...</p>
          </div>
        )}
      </div>
    </div>
  );
}
