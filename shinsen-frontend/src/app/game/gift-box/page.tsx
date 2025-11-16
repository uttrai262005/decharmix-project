"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./GiftBox.module.css";
import { FiGift, FiDatabase, FiKey, FiLoader, FiXCircle } from "react-icons/fi"; // Thêm FiXCircle
import Image from "next/image";

// === SỬA 1: ĐỊNH NGHĨA TYPE KHỚP VỚI BACKEND ===
// (Backend có "xu", "voucher", "ticket", "nothing", "fail")
type PrizeType = "xu" | "voucher" | "ticket" | "fail" | "nothing";

interface PrizeResult {
  name: string;
  type: PrizeType;
  value: string; // value từ CSDL là 'text', có thể là "100" hoặc "CODE10K"
}

export default function GiftBoxPage() {
  const { user, token, refreshUserStats } = useAuth();

  // === SỬA 2: THÊM API_URL ===
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [boxKeys, setBoxKeys] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrizeResult | null>(null);
  const [shakingBox, setShakingBox] = useState<number | null>(null);

  // Lấy số xu và chìa khóa
  useEffect(() => {
    if (user && API_URL && token) {
      // Thêm check API_URL
      setUserCoins(user.coins);

      // === SỬA 3: THÊM API_URL VÀ .catch() ===
      fetch(`${API_URL}/api/games/stats`, {
        // Đã có 's' (tốt)
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Lỗi tải thông tin game");
          return res.json();
        })
        .then((data) => {
          // API stats trả về tất cả vé, bao gồm 'box_keys'
          setBoxKeys(data.box_keys || 0);
        })
        .catch((err) => {
          console.error(err.message);
          // Có thể set 1 thông báo lỗi ở đây
        });
    }
  }, [user, token, API_URL]); // Thêm API_URL vào dependency

  // Hàm mở hộp
  const handleOpenBox = async (boxIndex: number) => {
    // Thêm check API_URL
    if (boxKeys <= 0 || isLoading || result || !API_URL) {
      return;
    }

    setIsLoading(true);
    setShakingBox(boxIndex);
    setResult(null);

    try {
      // === SỬA 4: THÊM API_URL ===
      const response = await fetch(`${API_URL}/api/games/open-box`, {
        // Đã có 's' (tốt)
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mở hộp thất bại");

      // Mở hộp thành công
      setResult({
        name: data.prize_name,
        type: data.prize_type, // Backend trả về 'xu', 'voucher', 'ticket'...
        value: data.prize_value,
      });

      await refreshUserStats();
    } catch (error: any) {
      console.error(error);
      setResult({ name: error.message, type: "fail", value: "0" });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setShakingBox(null);
      }, 1000);
    }
  };

  // Hàm chơi lại
  const playAgain = () => {
    setResult(null);
    setIsLoading(false);
    // Cập nhật lại số chìa từ user context (đã được refresh)
    if (user) setBoxKeys(user.box_keys || 0);
  };

  // === SỬA 5: CẬP NHẬT RENDER ICON ===
  const renderPrizeIcon = (type: PrizeType) => {
    if (type === "xu") {
      return <FiDatabase className={styles.prizeIcon} />;
    }
    if (type === "voucher") {
      return <FiGift className={styles.prizeIcon} />;
    }
    if (type === "ticket") {
      // Thêm icon cho vé (ví dụ: chìa khóa)
      return <FiKey className={styles.prizeIcon} />;
    }
    // "fail" hoặc "nothing"
    return <FiXCircle className={styles.prizeIcon} />;
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Hộp Quà Bí Ẩn</h1>
        <p className={styles.subtitle}>
          Dùng chìa khóa của bạn để mở 1 trong 3 hộp quà và nhận thưởng!
        </p>

        {/* Thông tin User */}
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

        {/* === KHU VỰC HỘP QUÀ === */}
        <div className={styles.boxGrid}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={styles.boxContainer}
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
                {/* Bạn cần có ảnh /game-gift-box.png trong thư mục /public */}
                <Image
                  src="/game-gift-box.png"
                  alt="Hộp quà"
                  width={150}
                  height={150}
                  priority // Ưu tiên tải ảnh
                />
              </div>
            </div>
          ))}
        </div>

        {/* === KHU VỰC KẾT QUẢ (Sau khi mở) === */}
        {result && (
          <div className={styles.resultPopup}>
            {renderPrizeIcon(result.type)}
            <h2 className={styles.resultTitle}>
              {result.type === "fail" || result.type === "nothing"
                ? "Ôi!"
                : "Chúc Mừng!"}
            </h2>
            <p className={styles.resultMessage}>
              Bạn đã trúng: <strong>{result.name}</strong>
            </p>
            <button
              onClick={playAgain}
              className={styles.playAgainButton}
              disabled={boxKeys <= 0}
            >
              {boxKeys > 0 ? "Mở hộp khác" : "Đã hết chìa khóa"}
            </button>
          </div>
        )}

        {/* Lớp phủ Loading */}
        {isLoading && !result && (
          <div className={styles.loadingOverlay}>
            <FiLoader className={styles.loaderIcon} />
            <p>Đang mở hộp...</p>
          </div>
        )}
      </div>
    </div>
  );
}
