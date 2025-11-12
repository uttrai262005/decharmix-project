"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ClaimGift.module.css";
import { FiGift, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

type PageStep = "loading" | "gift" | "form" | "success" | "error";

interface GiftDetails {
  senderName: string;
  recipientName: string;
  message: string;
}

export default function ClaimGiftPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [step, setStep] = useState<PageStep>("loading");
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [error, setError] = useState("");

  // State cho Form
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    ward: "",
    district: "",
    province: "",
    phone: "",
  });

  // 1. Lấy thông tin quà
  useEffect(() => {
    if (!token) return;

    fetch(`/api/orders/gift-details/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Lỗi không xác định");
        }
        return res.json();
      })
      .then((data) => {
        setGiftDetails(data);
        setStep("gift");
      })
      .catch((err) => {
        setError(err.message);
        setStep("error");
      });
  }, [token]);

  // 2. Xử lý form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  // 3. Gửi địa chỉ
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("loading"); // Hiển thị loading

    try {
      const res = await fetch("/api/orders/claim-gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, shippingInfo }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi khi gửi địa chỉ");
      }

      setStep("success"); // Chuyển sang màn hình thành công
    } catch (err: any) {
      setError(err.message);
      setStep("form"); // Quay lại form nếu lỗi
    }
  };

  // Render
  const renderContent = () => {
    switch (step) {
      case "loading":
        return <p>Đang tải món quà...</p>;

      case "error":
        return (
          <div className={styles.centered}>
            <FiAlertTriangle size={50} color="#ef4444" />
            <h2 className={styles.title}>Đã xảy ra lỗi</h2>
            <p>{error}</p>
          </div>
        );

      case "success":
        return (
          <div className={styles.centered}>
            <FiCheckCircle size={50} color="#22c55e" />
            <h2 className={styles.title}>Nhận quà thành công!</h2>
            <p>Decharmix sẽ sớm gói hàng và gửi đến địa chỉ của bạn. Cảm ơn!</p>
            <button onClick={() => router.push("/")} className={styles.button}>
              Về trang chủ
            </button>
          </div>
        );

      case "gift":
        return (
          <div className={styles.centered}>
            <FiGift size={50} color="var(--brand-pink)" />
            <h2 className={styles.title}>Chào {giftDetails?.recipientName}!</h2>
            <p>
              Bạn có một món quà từ <strong>{giftDetails?.senderName}</strong>
            </p>
            <blockquote className={styles.message}>
              {giftDetails?.message}
            </blockquote>
            <button onClick={() => setStep("form")} className={styles.button}>
              Mở Quà & Nhận
            </button>
          </div>
        );

      case "form":
        return (
          <form onSubmit={handleSubmitAddress}>
            <h2 className={styles.title}>Điền thông tin nhận hàng</h2>
            <p>
              Vui lòng nhập chính xác địa chỉ để Decharmix gửi quà đến bạn nhé.
            </p>
            <div className={styles.inputGroup}>
              <label htmlFor="address">Địa chỉ (Số nhà, Tên đường)</label>
              <input
                type="text"
                name="address"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="ward">Phường / Xã</label>
              <input
                type="text"
                name="ward"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="district">Quận / Huyện</label>
              <input
                type="text"
                name="district"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="province">Tỉnh / Thành phố</label>
              <input
                type="text"
                name="province"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                onChange={handleInputChange}
                required
              />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
            <button type="submit" className={styles.button}>
              Xác nhận địa chỉ
            </button>
          </form>
        );
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>{renderContent()}</div>
    </div>
  );
}
