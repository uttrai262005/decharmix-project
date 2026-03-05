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
  FiGift,
} from "react-icons/fi";
import QRCode from "react-qr-code";
import styles from "./CheckoutPage.module.css";

type PaymentMethod = "bank" | "cod" | "momo" | "vnpay" | "zalopay";

// --- INTERFACES ---
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

// --- XỬ LÝ URL AN TOÀN ---
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

export default function CheckoutPage() {
  const { cartItems, cartTotal, itemCount, clearCart } = useCart();
  const { token, user } = useAuth();
  const router = useRouter();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    ward: "",
    district: "",
    province: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("bank");

  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(
    null,
  );
  const [useCoins, setUseCoins] = useState(false);

  const [isDigitalGift, setIsDigitalGift] = useState(false);
  const [recipientInfo, setRecipientInfo] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientMessage: "",
  });

  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    orderCode: string;
    vietQRString: string;
    total: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách voucher
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/vouchers/my`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType?.includes("application/json"))
            throw new Error("Lỗi tải voucher");
          return res.json();
        })
        .then((data) => setMyVouchers(data))
        .catch((err) => console.error("Không thể tải voucher:", err));
    }
  }, [token]);

  // Lấy Tỉnh/Thành
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data: Province[]) => setProvinces(data))
      .catch((err) => console.error("Lỗi địa chỉ:", err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

  const handleRecipientChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRecipientInfo({ ...recipientInfo, [e.target.name]: e.target.value });
  };

  const { coinDiscount, finalTotal, maxCoinsAllowed } = useMemo(() => {
    const userCoins = user?.coins || 0;
    const calculatedMaxCoins = Math.floor(cartTotal * 0.5);
    const coinsToUse = Math.min(
      userCoins,
      calculatedMaxCoins,
      cartTotal - voucherDiscount,
    );
    const calculatedCoinDiscount = useCoins ? coinsToUse : 0;
    const calculatedFinalTotal =
      cartTotal - voucherDiscount - calculatedCoinDiscount;
    return {
      coinDiscount: calculatedCoinDiscount,
      finalTotal: Math.max(0, calculatedFinalTotal),
      maxCoinsAllowed: coinsToUse,
    };
  }, [cartTotal, voucherDiscount, useCoins, user]);

  const handleApplyVoucher = async (code: string) => {
    if (!code) return;
    setPromoError(null);
    setPromoSuccess(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/apply-voucher`, {
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !isDigitalGift &&
      (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.province)
    ) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        cartItems,
        total: finalTotal,
        paymentMethod: selectedPayment,
        voucherCode: appliedVoucherCode,
        discountAmount: voucherDiscount,
        coinsUsed: useCoins ? coinDiscount : 0,
        coinDiscountAmount: coinDiscount,
        isDigitalGift,
        ...(isDigitalGift ? recipientInfo : { shippingInfo }),
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi tạo đơn hàng.");

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
        router.push("/order-result?status=success");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (orderData) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.qrSuccessScreen}>
          <h3>Đặt hàng thành công!</h3>
          <div className={styles.qrContainer}>
            <QRCode value={orderData.vietQRString} size={256} />
            <div className={styles.qrInfo}>
              <p>
                Tổng tiền: <strong>{orderData.total.toLocaleString()} ₫</strong>
              </p>
              <p>
                Nội dung: <strong>{orderData.orderCode}</strong>
              </p>
            </div>
          </div>
          <Link href="/profile/orders" className={styles.viewOrderButton}>
            Xem lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <h3>Ví Voucher</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className={styles.closeModalButton}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.voucherList}>
              {myVouchers.filter((v) => v.min_order_value <= cartTotal).length >
              0 ? (
                myVouchers
                  .filter((v) => v.min_order_value <= cartTotal)
                  .map((voucher) => (
                    <div key={voucher.id} className={styles.voucherCard}>
                      <div className={styles.voucherInfo}>
                        <p className={styles.voucherCode}>{voucher.code}</p>
                        <p>{voucher.description}</p>
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
                <p>Không có voucher phù hợp.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={styles.pageWrapper}>
        <div className={styles.mainLayout}>
          <div className={styles.leftColumn}>
            <Link href="/" className={styles.logo}>
              Decharmix Checkout
            </Link>
            <form onSubmit={handlePlaceOrder}>
              <div className={styles.section}>
                <label
                  className={`${styles.giftToggle} ${isDigitalGift ? styles.active : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isDigitalGift}
                    onChange={() => setIsDigitalGift(!isDigitalGift)}
                  />
                  <FiGift /> Gửi dưới dạng Quà tặng tức thì
                </label>
              </div>

              {!isDigitalGift ? (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FiHome /> Giao hàng
                  </h3>
                  <div className={styles.formGrid}>
                    <input
                      name="name"
                      placeholder="Họ tên"
                      required
                      onChange={handleInputChange}
                      value={shippingInfo.name}
                    />
                    <input
                      name="phone"
                      placeholder="SĐT"
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
                      <option value="">Tỉnh/Thành</option>
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
                      value={
                        districts.find((d) => d.name === shippingInfo.district)
                          ?.code || ""
                      }
                    >
                      <option value="">Quận/Huyện</option>
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
                      value={shippingInfo.ward}
                    >
                      <option value="">Phường/Xã</option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    <input
                      name="address"
                      placeholder="Địa chỉ chi tiết"
                      required
                      onChange={handleInputChange}
                      value={shippingInfo.address}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    <FiGift /> Người nhận
                  </h3>
                  <div className={styles.formGrid}>
                    <input
                      name="recipientName"
                      placeholder="Tên người nhận"
                      required
                      onChange={handleRecipientChange}
                    />
                    <input
                      name="recipientEmail"
                      type="email"
                      placeholder="Email người nhận"
                      required
                      onChange={handleRecipientChange}
                    />
                    <textarea
                      name="recipientMessage"
                      placeholder="Lời nhắn..."
                      onChange={handleRecipientChange}
                    />
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FiCreditCard /> Thanh toán
                </h3>
                <div className={styles.paymentOptions}>
                  <div
                    className={`${styles.paymentOption} ${selectedPayment === "bank" ? styles.selected : ""}`}
                    onClick={() => setSelectedPayment("bank")}
                  >
                    VietQR
                  </div>
                  <div
                    className={`${styles.paymentOption} ${selectedPayment === "momo" ? styles.selected : ""}`}
                    onClick={() => setSelectedPayment("momo")}
                  >
                    MoMo
                  </div>
                  {!isDigitalGift && (
                    <div
                      className={`${styles.paymentOption} ${selectedPayment === "cod" ? styles.selected : ""}`}
                      onClick={() => setSelectedPayment("cod")}
                    >
                      COD
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className={styles.placeOrderButton}
                disabled={isLoading}
              >
                <FiLock /> {isLoading ? "ĐANG XỬ LÝ..." : "HOÀN TẤT ĐẶT HÀNG"}
              </button>
            </form>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.summaryCard}>
              <h3 className={styles.sectionTitle}>
                <FiPackage /> Đơn hàng ({itemCount})
              </h3>
              {cartItems.map((item) => (
                <div key={item.product_id} className={styles.orderItem}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.image_url || "/placeholder.png"}
                      alt={item.name}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className={styles.itemName}>
                    {item.name} (x{item.quantity})
                  </div>
                  <div>
                    {(
                      (item.discount_price || item.price) * item.quantity
                    ).toLocaleString()}{" "}
                    ₫
                  </div>
                </div>
              ))}
              <div className={styles.promoSection}>
                <button
                  type="button"
                  className={styles.openModalButton}
                  onClick={() => setIsVoucherModalOpen(true)}
                >
                  <FiTag /> Chọn voucher
                </button>
                {user && user.coins > 0 && (
                  <label>
                    <input
                      type="checkbox"
                      checked={useCoins}
                      onChange={(e) => setUseCoins(e.target.checked)}
                    />{" "}
                    Dùng {user.coins} Xu
                  </label>
                )}
              </div>
              <div className={styles.costSummary}>
                <div className={styles.costRow}>
                  <span>Tạm tính:</span>
                  <span>{cartTotal.toLocaleString()} ₫</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className={styles.costRow}>
                    <span>Giảm Voucher:</span>
                    <span>-{voucherDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                {coinDiscount > 0 && (
                  <div className={styles.costRow}>
                    <span>Giảm Xu:</span>
                    <span>-{coinDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className={styles.grandTotal}>
                  <span>Tổng cộng:</span>
                  <span>{finalTotal.toLocaleString()} ₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
