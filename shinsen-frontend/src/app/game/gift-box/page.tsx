"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./GiftBox.module.css";
import { FiGift, FiDatabase, FiKey, FiLoader } from "react-icons/fi";
import Image from "next/image";

// Định nghĩa các loại giải thưởng
type PrizeType = "coins" | "voucher" | "nothing";

interface PrizeResult {
  name: string;
  type: PrizeType;
  value: number;
}

export default function GiftBoxPage() {
  const { user, token, refreshUserStats } = useAuth();
  const [boxKeys, setBoxKeys] = useState(0);
  const [userCoins, setUserCoins] = useState(0);

  const [isLoading, setIsLoading] = useState(false); // Đang mở hộp...
  const [result, setResult] = useState<PrizeResult | null>(null); // Kết quả
  const [shakingBox, setShakingBox] = useState<number | null>(null); // Hộp đang rung

  // Lấy số xu và chìa khóa
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      // Giả định 'user' từ context chưa có 'box_keys', ta gọi API
      fetch("/api/game/stats", {
        // API này trả về cả 'spin_tickets' và 'box_keys' (nếu bạn cập nhật API stats)
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // Nếu API 'stats' chưa trả về 'box_keys', bạn cần sửa API đó
          // Tạm thời lấy từ user context (nếu bạn đã thêm 'box_keys' vào AuthContext)
          setBoxKeys(data.box_keys || user.box_keys || 0);
        });
    }
  }, [user, token]);

  // Hàm mở hộp
  const handleOpenBox = async (boxIndex: number) => {
    if (boxKeys <= 0 || isLoading || result) {
      return; // Không cho mở nếu hết chìa, đang mở, hoặc đã mở
    }

    setIsLoading(true);
    setShakingBox(boxIndex); // Làm rung hộp đã chọn
    setResult(null);

    try {
      const response = await fetch("/api/game/open-box", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mở hộp thất bại");

      // Mở hộp thành công
      setResult({
        name: data.prize_name,
        type: data.prize_type,
        value: data.prize_value,
      });

      // Cập nhật lại AuthContext (lấy xu mới và chìa khóa mới)
      await refreshUserStats();
    } catch (error: any) {
      console.error(error);
      setResult({ name: error.message, type: "nothing", value: 0 });
    } finally {
      // Dừng rung sau 1s
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
    // Lấy lại số chìa khóa (đã được refreshUserStats cập nhật)
    if (user) setBoxKeys(user.box_keys || 0);
  };

  // Hiển thị Icon giải thưởng
  const renderPrizeIcon = (type: PrizeType) => {
    if (type === "coins") {
      return <FiDatabase className={styles.prizeIcon} />;
    }
    if (type === "voucher") {
      return <FiGift className={styles.prizeIcon} />;
    }
    return <span className={styles.prizeIcon}>😢</span>;
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
                {/* Đây là hình ảnh Hộp quà (Bạn cần có ảnh này) */}
                <Image
                  src="/game-gift-box.png"
                  alt="Hộp quà"
                  width={150}
                  height={150}
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
              {result.type === "nothing" ? "Ôi!" : "Chúc Mừng!"}
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
