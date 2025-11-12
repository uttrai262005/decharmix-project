"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import styles from "./OrderResult.module.css";

export default function OrderResultPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failure">(
    "loading"
  );
  const [message, setMessage] = useState("Đang xử lý kết quả...");

  useEffect(() => {
    // Check for VNPay response
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === "00") {
        setStatus("success");
        setMessage("Thanh toán qua VNPay thành công! Cảm ơn bạn đã mua hàng.");
      } else {
        setStatus("failure");
        setMessage("Giao dịch VNPay không thành công hoặc đã bị hủy.");
      }
      return;
    }

    // Check for MoMo response
    const resultCode = searchParams.get("resultCode");
    if (resultCode) {
      if (resultCode === "0") {
        setStatus("success");
        setMessage("Thanh toán qua MoMo thành công! Cảm ơn bạn đã mua hàng.");
      } else {
        setStatus("failure");
        setMessage(
          searchParams.get("message") ||
            "Giao dịch MoMo không thành công hoặc đã bị hủy."
        );
      }
      return;
    }

    // Check for ZaloPay response (MỚI)
    const zalo_Status = searchParams.get("status");
    if (zalo_Status) {
      if (zalo_Status === "1") {
        setStatus("success");
        setMessage(
          "Thanh toán qua ZaloPay thành công! Cảm ơn bạn đã mua hàng."
        );
      } else {
        setStatus("failure");
        setMessage("Giao dịch ZaloPay không thành công hoặc đã bị hủy.");
      }
      return;
    }

    // Fallback if no params found (e.g., for COD)
    setStatus("success");
    setMessage(
      "Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn để xác nhận."
    );
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "success" ? (
          <FiCheckCircle className={`${styles.icon} ${styles.success}`} />
        ) : (
          <FiXCircle className={`${styles.icon} ${styles.failure}`} />
        )}
        <h1 className={styles.title}>
          {status === "success"
            ? "Thanh toán thành công"
            : "Thanh toán thất bại"}
        </h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Link href="/products" className={styles.button}>
            Tiếp tục mua sắm
          </Link>
          {status === "failure" && (
            <Link
              href="/checkout"
              className={`${styles.button} ${styles.retryButton}`}
            >
              Thử lại thanh toán
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
