"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiCreditCard,
  FiPackage,
  FiHome,
  FiTag,
  FiDatabase,
  FiX,
  FiGift, // <-- Thêm icon Quà
} from "react-icons/fi";
import QRCode from "react-qr-code";
import styles from "./CheckoutPage.module.css";

type PaymentMethod = "bank" | "cod" | "momo" | "vnpay" | "zalopay";

// === KHAI BÁO INTERFACE ===
interface Province {
  code: number;
  name: string;
}
interface District {
  code: number;
  name: string;
  wards: Ward[];
}
interface Ward {
  code: number;
  name: string;
}
interface Voucher {
  id: number;
  code: string;
  description: string;
  type: "fixed" | "percent" | "shipping";
  value: number;
  min_order_value: number;
  max_discount?: number;
}
// ===================================

export default function CheckoutPage() {
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();
  const { token, user } = useAuth();
  const router = useRouter();

  // State cho địa chỉ
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // State cho form
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("bank");

  // State cho Khuyến mãi
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(
    null
  );
  const [useCoins, setUseCoins] = useState(false);

  // === SỬA 1: THÊM STATE CHO QUÀ TẶNG ===
  const [isDigitalGift, setIsDigitalGift] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientMessage: "",
  });
  // =======================================

  // State cho Đơn hàng & Lỗi
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    orderCode: string;
    vietQRString: string;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách voucher của user
  useEffect(() => {
    if (token) {
      fetch("/api/vouchers/my", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setMyVouchers(data))
        .catch((err) => console.error("Không thể tải voucher của bạn:", err));
    }
  }, [token]);

  // Lấy danh sách Tỉnh/Thành
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch((err) => console.error("Lỗi khi tải danh sách tỉnh thành:", err));
  }, []);

  // Xử lý thay đổi input/select địa chỉ (shippingInfo)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newShippingInfo = { ...shippingInfo, [name]: value };

    if (e.target.tagName === "SELECT") {
      const selectElement = e.target as HTMLSelectElement;
      const selectedOptionText =
        selectElement.options[selectElement.selectedIndex].text;

      if (name === "province") {
        newShippingInfo = {
          ...newShippingInfo,
          province: selectedOptionText,
          district: "",
          ward: "",
        };
        setDistricts([]);
        setWards([]);
        if (value) {
          fetch(`https://provinces.open-api.vn/api/p/${value}?depth=2`)
            .then((res) => res.json())
            .then((data) => setDistricts(data.districts || []));
        }
      } else if (name === "district") {
        newShippingInfo = {
          ...newShippingInfo,
          district: selectedOptionText,
          ward: "",
        };
        setWards([]);
        if (value) {
          fetch(`https://provinces.open-api.vn/api/d/${value}?depth=2`)
            .then((res) => res.json())
            .then((data) => setWards(data.wards || []));
        }
      } else if (name === "ward") {
        newShippingInfo = { ...newShippingInfo, ward: selectedOptionText };
      }
    }
    setShippingInfo(newShippingInfo);
  };

  // === SỬA 2: HÀM MỚI CHO FORM QUÀ TẶNG ===
  const handleRecipientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRecipientInfo({
      ...recipientInfo,
      [e.target.name]: e.target.value,
    });
  };
  // =======================================

  // Tính toán lại tổng tiền (Logic giữ nguyên)
  const { coinDiscount, finalTotal, maxCoinsAllowed } = useMemo(() => {
    const userCoins = user?.coins || 0;
    const originalTotal = cartTotal;
    const totalAfterVoucher = originalTotal - voucherDiscount;
    const calculatedMaxCoins = Math.floor(originalTotal * 0.5);
    const coinsToUse = Math.min(
      userCoins,
      calculatedMaxCoins,
      totalAfterVoucher
    );
    const calculatedCoinDiscount = useCoins ? coinsToUse : 0;
    const calculatedFinalTotal = totalAfterVoucher - calculatedCoinDiscount;
    return {
      coinDiscount: calculatedCoinDiscount,
      finalTotal: calculatedFinalTotal < 0 ? 0 : calculatedFinalTotal,
      maxCoinsAllowed: coinsToUse,
    };
  }, [cartTotal, voucherDiscount, useCoins, user]);

  // Hàm Áp dụng Voucher (Logic giữ nguyên)
  const handleApplyVoucher = async (code: string) => {
    if (!code) return;
    setPromoError(null);
    setPromoSuccess(null);
    try {
      const res = await fetch("/api/orders/apply-voucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, cartTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVoucherDiscount(data.discountAmount);
      setAppliedVoucherCode(data.voucherCode);
      setPromoSuccess(data.message);
      setIsVoucherModalOpen(false);
      setVoucherInput("");
      setUseCoins(false);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedVoucherCode(null);
      setVoucherDiscount(0);
    }
  };

  // Hàm Bật/Tắt Xu (Logic giữ nguyên)
  const handleToggleCoins = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseCoins(e.target.checked);
  };

  // --- HÀM ĐẶT HÀNG (ĐÃ CẬP NHẬT) ---
  const validateShippingInfo = () => {
    const { name, phone, address, ward, district, province } = shippingInfo;
    return !(!name || !phone || !address || !ward || !district || !province);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // === SỬA 3: CẬP NHẬT LOGIC VALIDATE ===
    if (!isDigitalGift && !validateShippingInfo()) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }
    if (
      isDigitalGift &&
      (!recipientInfo.recipientName || !recipientInfo.recipientEmail)
    ) {
      setError("Vui lòng nhập Tên và Email của người nhận quà.");
      return;
    }
    // ======================================

    setIsLoading(true);
    try {
      // === SỬA 4: CẬP NHẬT PAYLOAD GỬI LÊN ===
      const payload = {
        cartItems,
        total: finalTotal, // Gửi TỔNG TIỀN CUỐI CÙNG
        paymentMethod: selectedPayment,
        voucherCode: appliedVoucherCode,
        discountAmount: voucherDiscount,
        coinsUsed: useCoins ? coinDiscount : 0,
        coinDiscountAmount: coinDiscount,
        isDigitalGift: isDigitalGift, // Báo cho backend đây là quà
      };

      if (isDigitalGift) {
        // Gửi thông tin người nhận
        Object.assign(payload, recipientInfo);
      } else {
        // Gửi thông tin giao hàng
        Object.assign(payload, { shippingInfo });
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload), // Gửi payload đã xử lý
      });
      // ======================================

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Có lỗi xảy ra khi tạo đơn hàng.");

      clearCart();

      if (data.vietQRString) {
        setOrderData({
          orderCode: data.orderCode,
          vietQRString: data.vietQRString,
          total: finalTotal,
        });
      } else if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        // Nếu là quà tặng, cũng chuyển hướng đến trang thành công
        router.push("/order-result");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Màn hình QR (Giữ nguyên)
  if (orderData) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.qrSuccessScreen}>
          <h3>Đặt hàng thành công!</h3>
          <p>Vui lòng quét mã VietQR...</p>
          <div className={styles.qrContainer}>
            <QRCode
              value={orderData.vietQRString}
              size={256}
              viewBox={`0 0 256 256`}
            />
            <div className={styles.qrInfo}>
              <p>Tổng tiền</p>
              <p className={styles.qrAmount}>
                {orderData.total.toLocaleString("vi-VN")} ₫
              </p>
              <p>Nội dung chuyển khoản</p>
              <p className={styles.bankMemo}>{orderData.orderCode}</p>
            </div>
          </div>
          <p className={styles.bankNote}>
            Sau khi chuyển khoản, hệ thống sẽ tự động xác nhận.
          </p>
          <Link href="/profile/orders" className={styles.viewOrderButton}>
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  // Lấy văn bản cho nút bấm (Giữ nguyên)
  const getButtonText = () => {
    if (isLoading) return "ĐANG XỬ LÝ...";
    if (selectedPayment === "momo") return "TIẾP TỤC VỚI MOMO";
    if (selectedPayment === "vnpay") return "TIẾP TỤC VỚI VNPAY";
    if (selectedPayment === "zalopay") return "TIẾP TỤC VỚI ZALOPAY";
    return "HOÀN TẤT ĐẶT HÀNG";
  };

  // --- GIAO DIỆN CHECKOUT CHÍNH ---
  return (
    <>
      {/* === MODAL VOUCHER (Giữ nguyên) === */}
      {isVoucherModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsVoucherModalOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Ví Voucher Của Bạn</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className={styles.closeModalButton}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.voucherList}>
              {myVouchers.length > 0 ? (
                myVouchers
                  .filter((v) => v.min_order_value <= cartTotal)
                  .map((voucher) => (
                    <div key={voucher.id} className={styles.voucherCard}>
                      <div className={styles.voucherInfo}>
                        <p className={styles.voucherCode}>{voucher.code}</p>
                        <p className={styles.voucherDesc}>
                          {voucher.description}
                        </p>
                        <p className={styles.voucherMin}>
                          Đơn tối thiểu:{" "}
                          {Number(voucher.min_order_value).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          ₫
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyVoucher(voucher.code)}
                        className={styles.voucherApplyButton}
                      >
                        Áp dụng
                      </button>
                    </div>
                  ))
              ) : (
                <p>Bạn không có voucher nào.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === TRANG CHECKOUT CHÍNH === */}
      <div className={styles.pageWrapper}>
        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            <Link href="/" className={styles.logo}>
              Decharmix Checkout
            </Link>
            <form onSubmit={handlePlaceOrder}>
              {/* === SỬA 5: THÊM CHECKBOX QUÀ TẶNG === */}
              <div className={styles.section}>
                <label
                  className={`${styles.giftToggle} ${
                    isDigitalGift ? styles.active : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isDigitalGift}
                    onChange={() => setIsDigitalGift(!isDigitalGift)}
                  />
                  <FiGift /> Gửi dưới dạng Quà Tặng Tức Thì
                  <span>(Gửi link cho người nhận tự điền địa chỉ)</span>
                </label>
              </div>
              {/* ================================== */}

              {/* --- Thông tin giao hàng (Đơn thường) --- */}
              {!isDigitalGift && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FiHome /> Thông tin giao hàng
                  </h3>
                  <div className={styles.formGrid}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Họ và tên"
                      required
                      onChange={handleInputChange}
                      value={shippingInfo.name}
                    />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Số điện thoại"
                      required
                      onChange={handleInputChange}
                      value={shippingInfo.phone}
                    />
                    <select
                      name="province"
                      required
                      onChange={handleInputChange}
                      value={
                        provinces.find((p) => p.name === shippingInfo.province)
                          ?.code || ""
                      }
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="district"
                      required
                      onChange={handleInputChange}
                      disabled={!districts.length}
                      value={
                        districts.find((d) => d.name === shippingInfo.district)
                          ?.code || ""
                      }
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="ward"
                      required
                      onChange={handleInputChange}
                      disabled={!wards.length}
                      value={shippingInfo.ward}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <input
                      name="address"
                      type="text"
                      placeholder="Số nhà, tên đường"
                      required
                      onChange={handleInputChange}
                      value={shippingInfo.address}
                    />
                  </div>
                </div>
              )}

              {/* === SỬA 6: FORM QUÀ TẶNG (Đơn quà) === */}
              {isDigitalGift && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FiGift /> Thông tin người nhận quà
                  </h3>
                  <div className={styles.formGrid}>
                    <input
                      name="recipientName"
                      type="text"
                      placeholder="Tên người nhận"
                      required
                      onChange={handleRecipientChange}
                    />
                    <input
                      name="recipientEmail"
                      type="email"
                      placeholder="Email người nhận (để gửi link)"
                      required
                      onChange={handleRecipientChange}
                    />
                    <textarea
                      name="recipientMessage"
                      placeholder="Lời nhắn của bạn..."
                      onChange={handleRecipientChange}
                      className={styles.fullWidthInput}
                    />
                  </div>
                </div>
              )}
              {/* ================================== */}

              {/* --- Phương thức thanh toán --- */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FiCreditCard /> Phương thức thanh toán
                </h3>
                <div className={styles.paymentOptions}>
                  <div
                    className={`${styles.paymentOption} ${
                      selectedPayment === "bank" ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPayment("bank")}
                  >
                    <Image
                      src="/payment-bank.svg"
                      alt="Bank"
                      width={40}
                      height={40}
                      style={{ height: "auto" }}
                    />
                    <span>VietQR</span>
                  </div>
                  <div
                    className={`${styles.paymentOption} ${
                      selectedPayment === "momo" ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPayment("momo")}
                  >
                    <Image
                      src="/payment-momo.svg"
                      alt="Momo"
                      width={40}
                      height={40}
                      style={{ height: "auto" }}
                    />
                    <span>Ví MoMo</span>
                  </div>
                  <div
                    className={`${styles.paymentOption} ${
                      selectedPayment === "vnpay" ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPayment("vnpay")}
                  >
                    <Image
                      src="/payment-vnpay.svg"
                      alt="VNPay"
                      width={40}
                      height={40}
                      style={{ height: "auto" }}
                    />
                    <span>Cổng VNPay</span>
                  </div>
                  <div
                    className={`${styles.paymentOption} ${
                      selectedPayment === "zalopay" ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedPayment("zalopay")}
                  >
                    <Image
                      src="/payment-zalopay.svg"
                      alt="ZaloPay"
                      width={40}
                      height={40}
                      style={{ height: "auto" }}
                    />
                    <span>Ví ZaloPay</span>
                  </div>
                  {/* Ẩn COD nếu là quà tặng */}
                  {!isDigitalGift && (
                    <div
                      className={`${styles.paymentOption} ${
                        selectedPayment === "cod" ? styles.selected : ""
                      }`}
                      onClick={() => setSelectedPayment("cod")}
                    >
                      <Image
                        src="/payment-cod.svg"
                        alt="COD"
                        width={40}
                        height={40}
                        style={{ height: "auto" }}
                      />
                      <span>Tiền mặt (COD)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút Đặt hàng */}
              {error && <p className={styles.errorText}>{error}</p>}
              <button
                type="submit"
                className={styles.placeOrderButton}
                disabled={isLoading}
              >
                <FiLock />
                <span>{getButtonText()}</span>
              </button>
            </form>
          </div>

          {/* === CỘT BÊN PHẢI (TÓM TẮT ĐƠN HÀNG) === */}
          <div className={styles.rightColumn}>
            {/* --- Khung Tóm Tắt Sản Phẩm (Giữ nguyên) --- */}
            <div className={styles.summaryCard}>
              <h3 className={styles.sectionTitle}>
                <FiPackage /> Tóm tắt đơn hàng ({itemCount})
              </h3>
              <div className={styles.orderItems}>
                {cartItems.map((item) => (
                  <div key={item.product_id} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      <Image
                        src={item.image_url || "/placeholder.png"}
                        alt={item.name}
                        width={64}
                        height={64}
                      />
                      <span className={styles.itemQuantity}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>
                      {(
                        (item.discount_price || item.price) * item.quantity
                      ).toLocaleString("vi-VN")}{" "}
                      ₫
                    </div>
                  </div>
                ))}
              </div>

              {/* --- KHUNG KHUYẾN MÃI (Giữ nguyên) --- */}
              <div className={styles.promoSection}>
                <h3 className={styles.sectionTitle}>
                  <FiTag /> Khuyến mãi
                </h3>
                <div className={styles.voucherInputGroup}>
                  <input
                    type="text"
                    placeholder="Nhập mã voucher"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    disabled={!!appliedVoucherCode}
                  />
                  <button
                    type="button"
                    className={styles.applyButton}
                    onClick={() => handleApplyVoucher(voucherInput)}
                    disabled={!!appliedVoucherCode}
                  >
                    Áp dụng
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.openModalButton}
                  onClick={() => setIsVoucherModalOpen(true)}
                >
                  <FiTag /> Chọn voucher của Decharmix
                </button>
                {user && user.coins > 0 && (
                  <div className={styles.coinSection}>
                    <label>
                      <input
                        type="checkbox"
                        checked={useCoins}
                        onChange={handleToggleCoins}
                      />
                      Sử dụng {user.coins.toLocaleString("vi-VN")} Decharmix Xu
                      (Tối đa: {maxCoinsAllowed.toLocaleString("vi-VN")} Xu)
                    </label>
                  </div>
                )}
                {promoError && (
                  <p className={styles.promoMessageError}>{promoError}</p>
                )}
                {promoSuccess && (
                  <p className={styles.promoMessageSuccess}>{promoSuccess}</p>
                )}
              </div>

              {/* --- KHUNG TỔNG TIỀN (Giữ nguyên) --- */}
              <div className={styles.costSummary}>
                <div className={styles.costRow}>
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className={styles.costRow}>
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className={`${styles.costRow} ${styles.discount}`}>
                    <span>Giảm giá Voucher ({appliedVoucherCode})</span>
                    <span>- {voucherDiscount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
                {coinDiscount > 0 && (
                  <div className={`${styles.costRow} ${styles.discount}`}>
                    <span>Giảm giá Xu</span>
                    <span>- {coinDiscount.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
                <div className={`${styles.costRow} ${styles.grandTotal}`}>
                  <span>Tổng cộng</span>
                  <span>{finalTotal.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
