"use client";

import { useState, useEffect } from "react";
// 1. IMPORT DYNAMIC
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./LuckyWheel.module.css";
import { FiGift, FiDatabase } from "react-icons/fi";
import { WheelData } from "react-custom-roulette/dist/components/Wheel/types";

// 2. TẢI ĐỘNG COMPONENT <Wheel> VỚI SSR: FALSE
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

// 3. Mảng này GIỜ CHỈ CÒN LƯU STYLE
// (Bạn có thể thêm/bớt style nếu muốn, nó sẽ tự lặp lại)
const wheelStyles = [
  { style: { backgroundColor: "#fff5f9", textColor: "#be5985" } },
  { style: { backgroundColor: "#ffe2f2", textColor: "#7c596b" } },
];

export default function LuckyWheelPage() {
  const { user, token, refreshUserStats } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 4. TẠO STATE MỚI CHO VÒNG QUAY
  // WheelData là type từ thư viện
  const [wheelData, setWheelData] = useState<Partial<WheelData>[]>([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(true);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinTickets, setSpinTickets] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [resultMessage, setResultMessage] = useState("");

  // 5. TẢI DỮ LIỆU VÒNG QUAY KHI VÀO TRANG
  useEffect(() => {
    const fetchWheelPrizes = async () => {
      if (!API_URL) {
        setResultMessage("Lỗi: Không thể tải cấu hình server.");
        return;
      }
      setIsLoadingWheel(true);
      try {
        // Gọi API mới (đã thêm 's' -> /api/games)
        const res = await fetch(`${API_URL}/api/games/wheel-prizes`);
        if (!res.ok) throw new Error("Lỗi tải giải thưởng từ server");

        const prizesFromDB: { name: string }[] = await res.json();

        // Trộn data từ DB (name) với style (frontend)
        const finalWheelData = prizesFromDB.map((prize, index) => ({
          option: prize.name, // Lấy từ DB
          style: wheelStyles[index % wheelStyles.length].style, // Lấy style từ mảng trên
        }));

        setWheelData(finalWheelData);
      } catch (err: any) {
        console.error("Lỗi tải vòng quay:", err);
        setResultMessage(err.message);
      } finally {
        setIsLoadingWheel(false);
      }
    };
    fetchWheelPrizes();
  }, [API_URL]); // Chỉ chạy 1 lần khi API_URL sẵn sàng

  // 6. Tải stats của User (giữ nguyên)
  const fetchStats = async () => {
    if (!token || !API_URL) return;
    try {
      const res = await fetch(`${API_URL}/api/games/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSpinTickets(data.spin_tickets);
        setUserCoins(data.coins);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      setUserCoins(user.coins);
      setSpinTickets(user.spin_tickets || 0);
      fetchStats();
    }
  }, [user, token]);

  // 7. Hàm Quay (giữ nguyên)
  const handleSpinClick = async () => {
    if (spinTickets <= 0) {
      setResultMessage("Bạn đã hết lượt quay.");
      return;
    }
    if (mustSpin) return;
    if (!API_URL) {
      setResultMessage("Lỗi kết nối. Vui lòng tải lại trang.");
      return;
    }
    setResultMessage("");

    try {
      const response = await fetch(`${API_URL}/api/games/spin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quay thất bại");

      const newPrizeNumber = data.prize_index;
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setSpinTickets((prev) => prev - 1);
    } catch (error: any) {
      console.error(error);
      setResultMessage(error.message);
      setMustSpin(false);
    }
  };

  // 8. SỬA HÀM onStopSpinning (dùng state động)
  const onStopSpinning = async () => {
    setMustSpin(false);

    // Lấy tên giải từ STATE (đã được tải từ DB), không hard-code nữa
    if (wheelData.length > 0) {
      setResultMessage(
        `Chúc mừng! Bạn đã trúng: ${wheelData[prizeNumber].option}`
      );
    }

    await refreshUserStats();
  };

  // 9. THÊM TRẠNG THÁI LOADING
  if (isLoadingWheel) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Đang tải vòng quay...</h1>
          {resultMessage && (
            <p className={styles.resultMessage}>{resultMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // 10. Giao diện (đã cập nhật data={wheelData})
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Vòng Quay May Mắn</h1>
        <p className={styles.subtitle}>
          Thử vận may để nhận Xu và Voucher độc quyền từ Decharmix!
        </p>

        {/* Thông tin User */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <FiDatabase />
            <span>Decharmix Xu:</span>
            <strong>{userCoins.toLocaleString("vi-VN")}</strong>
          </div>
          <div className={styles.statItem}>
            <FiGift />
            <span>Lượt quay:</span>
            <strong>{spinTickets}</strong>
          </div>
        </div>

        {/* Vòng quay */}
        <div className={styles.wheelContainer}>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData} // <-- SỬ DỤNG STATE ĐỘNG
            outerBorderColor={"#ffe2f2"}
            outerBorderWidth={10}
            innerBorderColor={"#ffe2f2"}
            innerBorderWidth={0}
            radiusLineColor={"#ffe2f2"}
            radiusLineWidth={5}
            textColors={["#be5985"]}
            fontSize={14}
            fontWeight={600}
            onStopSpinning={onStopSpinning}
          />
          <button
            className={styles.spinButton}
            onClick={handleSpinClick}
            disabled={mustSpin || spinTickets <= 0}
          >
            QUAY
          </button>
        </div>

        {/* Kết quả */}
        {resultMessage && (
          <p className={styles.resultMessage}>{resultMessage}</p>
        )}
      </div>
    </div>
  );
}
