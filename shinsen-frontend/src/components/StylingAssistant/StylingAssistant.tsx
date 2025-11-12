"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./StylingAssistant.module.css";
import {
  FiMessageSquare,
  FiX,
  FiGift,
  FiSun,
  FiStar,
  FiArrowLeft,
  FiLoader,
} from "react-icons/fi";

// Định nghĩa Product (để lưu kết quả)
interface Product {
  product_id: number;
  name: string;
  price: number;
  discount_price?: number;
  image_url: string[] | null;
}

type Step =
  | "start"
  | "fengshui_element"
  | "fengshui_category"
  | "gift_occasion"
  | "style_category"
  | "result";

export default function StylingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const router = useRouter();

  // State cho kết quả
  const [isLoading, setIsLoading] = useState(false);
  const [expertAdvice, setExpertAdvice] = useState("");
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Lưu lựa chọn
  const [element, setElement] = useState<string | null>(null);

  const handleReset = () => {
    setStep("start");
    setElement(null);
    setRecommendations([]);
    setExpertAdvice("");
  };

  // Hàm "Giả AI" (Viết lời khuyên)
  const getExpertAdvice = (category: string, tag: string): string => {
    // (Logic viết lời khuyên giữ nguyên)
    if (tag === "menh-hoa")
      return "Tuyệt! Mệnh Hỏa rất hợp với màu Đỏ, Tím, hoặc Xanh lá (Mộc sinh Hỏa). Đây là 3 mẫu rực rỡ nhất dành cho bạn:";
    if (tag === "menh-kim")
      return "Người mệnh Kim rất hợp với màu Trắng, Bạc, Vàng, Nâu (Thổ sinh Kim). Bạn tham khảo 3 mẫu trang sức thanh lịch này nhé:";
    if (tag === "menh-thuy")
      return "Màu Đen, Xanh biển và Trắng (Kim sinh Thủy) là lựa chọn tuyệt vời cho mệnh Thủy. Đây là 3 gợi ý Decharmix dành cho bạn:";
    if (tag === "menh-moc")
      return "Mệnh Mộc nên ưu tiên màu Xanh lá, Đen, Xanh biển (Thủy sinh Mộc). Decharmix gợi ý bạn 3 mẫu này nhé:";
    if (tag === "menh-tho")
      return "Mệnh Thổ sẽ hợp với màu Nâu, Vàng, hoặc các màu mệnh Hỏa (Hỏa sinh Thổ) như Đỏ, Hồng. Bạn xem thử 3 mẫu này nha:";
    if (tag === "cute")
      return "Decharmix hiểu rồi! Để thêm phần dễ thương, bạn hãy tham khảo 3 mẫu 'cute' nhất trong bộ sưu tập nhé:";
    if (tag === "thanh-lich")
      return "Phong cách thanh lịch, nhẹ nhàng? Bạn hãy xem 3 mẫu trang nhã này, chúng rất hợp với bạn đó:";
    if (tag === "dip-sinh-nhat")
      return "Một món quà sinh nhật thật ý nghĩa! Đây là 3 combo quà tặng được yêu thích nhất tại Decharmix:";
    return "Decharmix đã lọc ra 3 sản phẩm phù hợp nhất với lựa chọn của bạn:";
  };

  // Hàm xử lý kết quả (Fetch API)
  const handleResult = async (category: string, tag: string) => {
    setStep("result");
    setIsLoading(true);
    setExpertAdvice(getExpertAdvice(category, tag));

    try {
      const response = await fetch(
        `/api/products?category=${encodeURIComponent(
          category
        )}&tag=${encodeURIComponent(tag)}&limit=3`
      );
      if (!response.ok) throw new Error("Không tìm thấy sản phẩm");

      const data = await response.json();
      setRecommendations(data.products || []); // Lấy data.products
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render các bước (Logic này giữ nguyên)
  const renderStep = () => {
    switch (step) {
      case "start":
        return (
          <>
            <h3 className={styles.popupTitle}>Decharmix giúp bạn nhé!</h3>
            <p className={styles.popupSubtitle}>Bạn đang tìm...</p>
            <div className={styles.choiceGrid}>
              <button onClick={() => setStep("gift_occasion")}>
                <FiGift /> Tìm quà tặng
              </button>
              <button onClick={() => setStep("fengshui_element")}>
                <FiSun /> Sản phẩm hợp mệnh
              </button>
              <button onClick={() => setStep("style_category")}>
                <FiStar /> Phối đồ cho tôi
              </button>
            </div>
          </>
        );
      case "fengshui_element":
        return (
          <>
            <h3 className={styles.popupTitle}>Bạn thuộc mệnh gì?</h3>
            <div className={styles.choiceGrid}>
              <button
                onClick={() => {
                  setElement("menh-kim");
                  setStep("fengshui_category");
                }}
              >
                Kim
              </button>
              <button
                onClick={() => {
                  setElement("menh-moc");
                  setStep("fengshui_category");
                }}
              >
                Mộc
              </button>
              <button
                onClick={() => {
                  setElement("menh-thuy");
                  setStep("fengshui_category");
                }}
              >
                Thủy
              </button>
              <button
                onClick={() => {
                  setElement("menh-hoa");
                  setStep("fengshui_category");
                }}
              >
                Hỏa
              </button>
              <button
                onClick={() => {
                  setElement("menh-tho");
                  setStep("fengshui_category");
                }}
              >
                Thổ
              </button>
            </div>
          </>
        );
      case "fengshui_category":
        return (
          <>
            <h3 className={styles.popupTitle}>Bạn muốn tìm loại nào?</h3>
            <div className={styles.choiceGrid}>
              <button onClick={() => handleResult("VÒNG TAY", element!)}>
                Vòng Tay
              </button>
              <button onClick={() => handleResult("DÂY CHUYỀN", element!)}>
                Dây Chuyền
              </button>
              <button onClick={() => handleResult("PHỤ KIỆN TÓC", element!)}>
                Phụ Kiện Tóc
              </button>
            </div>
          </>
        );
      case "gift_occasion":
        return (
          <>
            <h3 className={styles.popupTitle}>Bạn tặng quà dịp gì?</h3>
            <div className={styles.choiceGrid}>
              <button
                onClick={() => handleResult("COMBO QUÀ TẶNG", "dip-sinh-nhat")}
              >
                Sinh nhật
              </button>
              <button onClick={() => handleResult("VÒNG TAY", "dip-cap-doi")}>
                Kỷ niệm (Cặp đôi)
              </button>
              <button
                onClick={() => handleResult("COMBO QUÀ TẶNG", "qua-tang")}
              >
                Chỉ là... muốn tặng!
              </button>
            </div>
          </>
        );
      case "style_category":
        return (
          <>
            <h3 className={styles.popupTitle}>Phong cách của bạn là gì?</h3>
            <div className={styles.choiceGrid}>
              <button onClick={() => handleResult("VÒNG TAY", "cute")}>
                Dễ thương (Cute)
              </button>
              <button onClick={() => handleResult("DÂY CHUYỀN", "thanh-lich")}>
                Thanh lịch (Elegant)
              </button>
              <button
                onClick={() => handleResult("VÒNG TAY", "phong-cach-bien")}
              >
                Tự do (Biển cả)
              </button>
              <button onClick={() => handleResult("VÒNG TAY", "anime")}>
                Anime (Ghibli...)
              </button>
            </div>
          </>
        );
      case "result":
        return (
          <>
            <p className={styles.expertAdvice}>{expertAdvice}</p>
            {isLoading ? (
              <div className={styles.loaderContainer}>
                <FiLoader className={styles.loader} />
                <p>Đang tìm sản phẩm...</p>
              </div>
            ) : (
              <div className={styles.recommendationList}>
                {recommendations.length > 0 ? (
                  recommendations.map((product) => (
                    <Link
                      href={`/products/${product.product_id}`}
                      key={product.product_id}
                      className={styles.recommendationCard}
                      onClick={() => setIsOpen(false)} // Tự đóng khi click
                    >
                      <div className={styles.recommendationImage}>
                        <Image
                          src={
                            (product.image_url && product.image_url[0]) ||
                            "/placeholder.png"
                          }
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="30vw"
                        />
                      </div>
                      <h4 className={styles.recommendationName}>
                        {product.name}
                      </h4>
                      <p className={styles.recommendationPrice}>
                        {(
                          product.discount_price || product.price
                        ).toLocaleString("vi-VN")}{" "}
                        ₫
                      </p>
                    </Link>
                  ))
                ) : (
                  <p>
                    Rất tiếc, Decharmix không tìm thấy sản phẩm nào phù hợp.
                  </p>
                )}
              </div>
            )}
          </>
        );
      default:
        return <p>Đang phát triển...</p>;
    }
  };

  // === 5. SỬA LẠI JSX (GIAO DIỆN) ===
  return (
    <>
      {/* Nút bấm nổi (Chỉ hiện khi Chatbot đóng) */}
      {!isOpen && (
        <button
          className={styles.floatingButton}
          onClick={() => setIsOpen(true)}
        >
          <FiMessageSquare size={24} />
          <span className={styles.buttonText}>Cần Tư Vấn?</span>
        </button>
      )}

      {/* Cửa sổ Chatbot (Chỉ hiện khi bấm nút) */}
      {isOpen && (
        <div className={styles.chatWidget}>
          {/* Header của Chatbot */}
          <div className={styles.widgetHeader}>
            <h3 className={styles.widgetTitle}>Trợ lý Decharmix</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              <FiX />
            </button>
          </div>

          {/* Body của Chatbot */}
          <div className={styles.widgetBody}>
            {step !== "start" && (
              <button className={styles.backButton} onClick={handleReset}>
                <FiArrowLeft /> Quay lại
              </button>
            )}
            {renderStep()}
          </div>
        </div>
      )}
    </>
  );
}
