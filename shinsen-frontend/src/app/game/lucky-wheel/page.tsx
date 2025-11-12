"use client";

import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./LuckyWheel.module.css";
import { FiGift, FiDatabase } from "react-icons/fi";

// Mảng giải thưởng (phải khớp 100% với backend)
const wheelData = [
  {
    option: "100 Xu",
    style: { backgroundColor: "#fff5f9", textColor: "#be5985" },
  }, // 0
  {
    option: "Chúc bạn may mắn",
    style: { backgroundColor: "#ffe2f2", textColor: "#7c596b" },
  }, // 1
  {
    option: "Voucher 10K",
    style: { backgroundColor: "#fff5f9", textColor: "#be5985" },
  }, // 2
  {
    option: "+1 Lượt quay",
    style: { backgroundColor: "#ffe2f2", textColor: "#7c596b" },
  }, // 3
  {
    option: "300 Xu",
    style: { backgroundColor: "#fff5f9", textColor: "#be5985" },
  }, // 4
  {
    option: "Chúc bạn may mắn",
    style: { backgroundColor: "#ffe2f2", textColor: "#7c596b" },
  }, // 5
  {
    option: "Voucher FreeShip",
    style: { backgroundColor: "#fff5f9", textColor: "#be5985" },
  }, // 6
  {
    option: "1,000 Xu",
    style: { backgroundColor: "#ffe2f2", textColor: "#be5985" },
  }, // 7
];

export default function LuckyWheelPage() {
  const { user, token, refreshUserStats } = useAuth();

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinTickets, setSpinTickets] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [resultMessage, setResultMessage] = useState("");

  // Hàm lấy stats (Lượt quay & Xu)
  const fetchStats = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/game/stats", {
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

  // Lấy stats khi user thay đổi (ví dụ: khi refreshUserStats được gọi)
  useEffect(() => {
    if (user) {
      setUserCoins(user.coins); // Lấy xu từ context
      setSpinTickets(user.spin_tickets || 0); // Lấy lượt quay từ context
      fetchStats(); // Gọi API để chắc chắn (nếu context chưa cập nhật)
    }
  }, [user, token]); // Chạy lại khi 'user' thay đổi

  // === SỬA LỖI 1: HÀM CLICK CHỈ ĐỂ LẤY KẾT QUẢ ===
  const handleSpinClick = async () => {
    if (spinTickets <= 0) {
      setResultMessage("Bạn đã hết lượt quay.");
      return;
    }
    if (mustSpin) return; // Đang quay

    setResultMessage(""); // Xóa thông báo cũ

    try {
      // 1. Gọi API backend để biết trúng gì
      const response = await fetch("/api/game/spin", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quay thất bại");

      // 2. Lấy kết quả từ backend (ví dụ: Index 1 - "Chúc may mắn")
      const newPrizeNumber = data.prize_index;

      // 3. Bảo Vòng quay: "Hãy quay và dừng ở ô số 1"
      setPrizeNumber(newPrizeNumber);

      // 4. Bắt đầu quay (frontend)
      setMustSpin(true);

      // 5. Trừ lượt quay (frontend) ngay lập tức
      setSpinTickets((prev) => prev - 1);

      // (Không setResultMessage hay refreshUserStats ở đây)
    } catch (error: any) {
      console.error(error);
      setResultMessage(error.message);
      setMustSpin(false); // Cho phép quay lại nếu API lỗi
    }
  };

  // === SỬA LỖI 2: HÀM NÀY CHỈ CHẠY KHI VÒNG QUAY ĐÃ DỪNG ===
  const onStopSpinning = async () => {
    // 1. Báo là đã quay xong
    setMustSpin(false);

    // 2. Hiển thị thông báo trúng thưởng (khớp với ô đã dừng)
    setResultMessage(
      `Chúc mừng! Bạn đã trúng: ${wheelData[prizeNumber].option}`
    );

    // 3. BÂY GIỜ MỚI GỌI API ĐỂ CẬP NHẬT LẠI SỐ XU (ĐÃ ĐƯỢC CỘNG Ở BACKEND)
    await refreshUserStats();
  };
  // ====================================================

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
            prizeNumber={prizeNumber} // Vị trí giải do backend quyết định
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
            onStopSpinning={onStopSpinning} // <-- GỌI HÀM KHI DỪNG
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
