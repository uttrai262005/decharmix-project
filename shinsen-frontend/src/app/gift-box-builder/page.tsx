"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import styles from "./GiftBoxBuilder.module.css";
import { FiBox, FiTrash, FiCheck } from "react-icons/fi";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url: string[] | null;
  discount_price?: number;
  category: string;
}

interface GiftBoxAssets {
  vongTay: Product[];
  dayChuyen: Product[];
  phuKienToc: Product[];
  phuKienGoiQua: Product[];
}

export default function GiftBoxBuilderPage() {
  const { addToCart } = useCart();
  const [assets, setAssets] = useState<GiftBoxAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // === STATE CHÍNH: TÁCH HỘP VÀ QUÀ ===
  const [selectedBox, setSelectedBox] = useState<Product | null>(null);
  const [selectedGifts, setSelectedGifts] = useState<Product[]>([]);
  // ===================================

  // 1. Tải assets từ API
  useEffect(() => {
    fetch("/api/products/gift-box-assets")
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải assets:", err);
        setIsLoading(false);
      });
  }, []);

  // 2. Tính tổng tiền (Cộng cả hộp và quà)
  const totalPrice = useMemo(() => {
    const giftsTotal = selectedGifts.reduce((total, item) => {
      return total + Number(item.discount_price || item.price);
    }, 0);
    const boxTotal = selectedBox
      ? Number(selectedBox.discount_price || selectedBox.price)
      : 0;
    return giftsTotal + boxTotal;
  }, [selectedGifts, selectedBox]);

  // 3. Hàm chọn/bỏ chọn (Logic mới)
  const handleToggleItem = (item: Product) => {
    if (item.category === "PHỤ KIỆN GÓI QUÀ") {
      // Logic cho Hộp Quà (Chỉ được chọn 1)
      setSelectedBox((prevBox) =>
        prevBox && prevBox.product_id === item.product_id ? null : item
      );
    } else {
      // Logic cho Quà (Chỉ được chọn nếu đã có hộp)
      if (!selectedBox) {
        alert("Vui lòng chọn Hộp quà hoặc Phụ kiện gói quà trước!");
        return;
      }
      setSelectedGifts((prevGifts) => {
        const isSelected = prevGifts.find(
          (p) => p.product_id === item.product_id
        );
        if (isSelected) {
          return prevGifts.filter((p) => p.product_id !== item.product_id);
        } else {
          return [...prevGifts, item];
        }
      });
    }
  };

  // 4. Hàm thêm tất cả vào giỏ hàng (Đã sửa lỗi)
  const handleAddAllToCart = () => {
    const allItems = [...selectedGifts];
    if (selectedBox) {
      allItems.push(selectedBox); // Thêm hộp quà vào ds
    }
    if (allItems.length === 0) return;

    allItems.forEach((item) => {
      // Gửi (ID, Số lượng)
      addToCart(item.product_id, 1);
    });

    // Reset
    setSelectedGifts([]);
    setSelectedBox(null);
  };

  // 5. Hàm render 1 khu vực sản phẩm (Cập nhật logic isSelected)
  const renderProductSection = (title: string, products: Product[]) => {
    if (!products || products.length === 0) return null;

    return (
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.productGrid}>
          {products.map((item) => {
            // Kiểm tra xem item này có phải HỘP đã chọn, hoặc QUÀ đã chọn
            const isSelected =
              (selectedBox && selectedBox.product_id === item.product_id) ||
              !!selectedGifts.find((p) => p.product_id === item.product_id);

            const price = item.discount_price || item.price;
            const firstImage =
              (item.image_url && item.image_url[0]) || "/placeholder.png";

            return (
              <div
                key={item.product_id}
                className={`${styles.productCard} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => handleToggleItem(item)}
              >
                <div className={styles.productImage}>
                  <Image
                    src={firstImage}
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {isSelected && (
                    <div className={styles.checkIcon}>
                      <FiCheck />
                    </div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{item.name}</h3>
                  <p className={styles.productPrice}>
                    {price.toLocaleString("vi-VN")} ₫
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  // 6. GOM HỘP VÀ QUÀ LẠI ĐỂ HIỂN THỊ
  const allSelectedItems = useMemo(() => {
    return selectedBox ? [selectedBox, ...selectedGifts] : [...selectedGifts];
  }, [selectedBox, selectedGifts]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>Xưởng Gói Quà Decharmix</h1>
        <p className={styles.subtitle}>
          Tự tay thiết kế hộp quà của riêng bạn. Chọn các món trang sức và phụ
          kiện gói quà bên dưới.
        </p>

        <div className={styles.mainLayout}>
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className={styles.leftColumn}>
            {isLoading ? (
              <p>Đang tải xưởng quà...</p>
            ) : (
              <>
                {/* Chỉ render các bước khác NẾU đã chọn Hộp */}
                {renderProductSection(
                  "Bước 1: Chọn Phụ Kiện Gói Quà (Hộp, Thiệp...)",
                  assets?.phuKienGoiQua || []
                )}
                {selectedBox && (
                  <>
                    {renderProductSection(
                      "Bước 2: Chọn Vòng Tay",
                      assets?.vongTay || []
                    )}
                    {renderProductSection(
                      "Bước 3: Chọn Dây Chuyền",
                      assets?.dayChuyen || []
                    )}
                    {renderProductSection(
                      "Bước 4: Chọn Phụ Kiện Tóc",
                      assets?.phuKienToc || []
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* CỘT PHẢI: TÓM TẮT HỘP QUÀ (STICKY) */}
          <div className={styles.rightColumn}>
            <div className={styles.summaryBox}>
              <h3 className={styles.summaryTitle}>
                <FiBox /> Hộp Quà Của Bạn
              </h3>

              {/* === KHU VỰC GIẢ LẬP TRỰC QUAN === */}
              <div className={styles.previewBox}>
                {!selectedBox ? (
                  <div className={styles.previewEmpty}>
                    <FiBox size={40} />
                    <p>Vui lòng chọn Hộp quà ở Bước 1</p>
                  </div>
                ) : (
                  <>
                    {/* Nền Hộp Quà */}
                    <Image
                      src={
                        (selectedBox.image_url && selectedBox.image_url[0]) ||
                        "/placeholder.png"
                      }
                      alt={selectedBox.name}
                      fill
                      style={{ objectFit: "cover", zIndex: 1, opacity: 0.3 }}
                      className={styles.previewBoxBg}
                      sizes="30vw"
                    />
                    {/* Các món quà bên trong */}
                    <div className={styles.previewItemsContainer}>
                      {selectedGifts.map((gift) => (
                        <div
                          key={gift.product_id}
                          className={styles.previewItem}
                        >
                          <Image
                            src={
                              (gift.image_url && gift.image_url[0]) ||
                              "/placeholder.png"
                            }
                            alt={gift.name}
                            fill
                            style={{ objectFit: "contain" }}
                            sizes="10vw"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* ============================= */}

              <div className={styles.summaryItemList}>
                {allSelectedItems.length === 0 ? (
                  <p className={styles.emptyText}>
                    Chọn sản phẩm ở bên trái...
                  </p>
                ) : (
                  allSelectedItems.map((item) => (
                    <div key={item.product_id} className={styles.summaryItem}>
                      <span className={styles.itemName}>
                        {/* Đánh dấu Hộp quà */}
                        {item.category === "PHỤ KIỆN GÓI QUÀ" && "[HỘP] "}
                        {item.name}
                      </span>
                      <span className={styles.itemPrice}>
                        {(item.discount_price || item.price).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </span>
                      <button
                        onClick={() => handleToggleItem(item)}
                        className={styles.removeButton}
                      >
                        <FiTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <hr className={styles.divider} />
              <div className={styles.summaryTotal}>
                <span>Tổng cộng:</span>
                <strong>{totalPrice.toLocaleString("vi-VN")} ₫</strong>
              </div>
              <button
                className={styles.addToCartButton}
                onClick={handleAddAllToCart}
                disabled={allSelectedItems.length === 0}
              >
                Thêm {allSelectedItems.length} món vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
