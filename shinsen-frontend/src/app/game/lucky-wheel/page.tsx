"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./LuckyWheel.module.css";
import { FiGift, FiDatabase } from "react-icons/fi";
import { toast } from "react-hot-toast";

// TẢI ĐỘNG COMPONENT <Wheel> VỚI SSR: FALSE
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false },
);

// XỬ LÝ URL AN TOÀN - TRIỆT TIÊU LỖI //
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

const wheelStyles = [
  { style: { backgroundColor: "#fff5f9", textColor: "#be5985" } },
  { style: { backgroundColor: "#ffe2f2", textColor: "#7c596b" } },
];

export default function LuckyWheelPage() {
  const { user, token, refreshUserStats, isAuthenticated } = useAuth();

  const [wheelData, setWheelData] = useState<any[]>([]);
  const [isLoadingWheel, setIsLoadingWheel] = useState(true);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinTickets, setSpinTickets] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [resultMessage, setResultMessage] = useState("");

  // Hàm tải dữ liệu vòng quay (prizes)
  const fetchWheelPrizes = useCallback(async () => {
    setIsLoadingWheel(true);
    try {
      const res = await fetch(`${API_URL}/api/games/wheel-prizes`);

      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType?.includes("application/json")) {
        throw new Error("Không thể kết nối dữ liệu vòng quay.");
      }

      const prizesFromDB: { name: string }[] = await res.json();
      const finalWheelData = prizesFromDB.map((prize, index) => ({
        option: prize.name,
        style: wheelStyles[index % wheelStyles.length].style,
      }));

      setWheelData(finalWheelData);
    } catch (err: any) {
      console.error("Lỗi tải vòng quay:", err);
      setResultMessage("Máy chủ vòng quay đang khởi động, vui lòng đợi...");
    } finally {
      setIsLoadingWheel(false);
    }
  }, []);

  // Tải stats của User
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/games/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSpinTickets(data.spin_tickets || 0);
        setUserCoins(data.coins || 0);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchWheelPrizes();
  }, [fetchWheelPrizes]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStats();
    }
  }, [isAuthenticated, token, fetchStats]);

  const handleSpinClick = async () => {
    if (spinTickets <= 0) {
      toast.error("Bạn đã hết lượt quay!");
      return;
    }
    if (mustSpin || !token) return;

    setResultMessage("");

    try {
      const response = await fetch(`${API_URL}/api/games/spin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quay thất bại");

      setPrizeNumber(data.prize_index);
      setMustSpin(true);
      // Giảm lượt quay ảo trên giao diện cho mượt
      setSpinTickets((prev) => prev - 1);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      setMustSpin(false);
    }
  };

  const onStopSpinning = async () => {
    setMustSpin(false);
    if (wheelData.length > 0) {
      const prizeName = wheelData[prizeNumber].option;
      setResultMessage(`🎉 Chúc mừng! Bạn đã trúng: ${prizeName}`);
      toast.success(`Trúng ${prizeName}!`);
    }
    // Cập nhật lại ví tiền và số lượt từ server
    await refreshUserStats();
    await fetchStats();
  };

  if (isLoadingWheel) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.container}>
          <h1 className={styles.title}>Đang tải vòng quay...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Vòng Quay May Mắn</h1>
        <p className={styles.subtitle}>Thử vận may nhận Xu và Voucher!</p>

        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <FiDatabase />
            <span>Xu:</span>
            <strong>{userCoins.toLocaleString("vi-VN")}</strong>
          </div>
          <div className={styles.statItem}>
            <FiGift />
            <span>Lượt quay:</span>
            <strong>{spinTickets}</strong>
          </div>
        </div>

        <div className={styles.wheelContainer}>
          {wheelData.length > 0 && (
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
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
          )}
          <button
            className={styles.spinButton}
            onClick={handleSpinClick}
            disabled={mustSpin || spinTickets <= 0}
          >
            {mustSpin ? "ĐANG QUAY..." : "QUAY"}
          </button>
        </div>

        {resultMessage && (
          <p className={styles.resultMessage}>{resultMessage}</p>
        )}
      </div>
    </div>
  );
}
