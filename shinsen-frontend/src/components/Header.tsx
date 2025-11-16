"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  FiShoppingCart,
  FiSearch,
  FiUser,
  FiMapPin,
  FiPhone,
  FiGift,
  FiCamera, // <-- 1. ĐÃ THÊM ICON MỚI
} from "react-icons/fi";
import styles from "./Header.module.css";
import VisualSearchModal from "./VisualSearchModal";

// Lấy API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Interface cho sản phẩm trong kết quả tìm kiếm
interface SearchResult {
  id: number;
  name: string;
  image_url: string[] | null;
}

// Component để highlight chữ trong kết quả tìm kiếm
const HighlightMatch = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className={styles.highlight}>
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems, itemCount, cartTotal } = useCart();
  const router = useRouter();

  // State quản lý trạng thái mở/đóng của các menu
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 3. ĐÃ THÊM STATE CHO MODAL AI
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);

  // Refs để theo dõi các element menu
  const cartRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // State cho chức năng tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Logic tìm kiếm "sống" với Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      // (Đã sửa: Dùng API_URL)
      fetch(`${API_URL}/api/products/search?q=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Logic gộp: đóng tất cả các menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false); // Đóng menu sau khi đăng xuất
    router.push("/");
  };

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setSearchQuery("");
    }
  };

  return (
    <>
      {" "}
      {/* 4. ĐÃ THÊM FRAGMENT */}
      <header className={styles.headerWrapper}>
        {/* ===== THANH THÔNG TIN PHỤ ===== */}
        <div className={styles.topBar}>
          <div className={styles.topBarContent}>
            <span>Phụ kiện handmade Decharmix</span>
            <div className={styles.topBarLinks}>
              <a href="#">
                <FiMapPin size={14} /> Hệ thống cửa hàng
              </a>
              <a href="#">
                <FiPhone size={14} /> Hỗ trợ
              </a>
            </div>
          </div>
        </div>

        {/* ===== THANH CHÍNH (LOGO, SEARCH, ACTIONS) ===== */}
        <div className={styles.mainHeader}>
          <div className={styles.mainHeaderContent}>
            <Link href="/" className={styles.logo}>
              Decharmix
            </Link>

            {/* Thanh tìm kiếm */}
            <div className={styles.searchContainer} ref={searchRef}>
              {/* 5. ĐÃ SỬA LẠI THANH SEARCH (THÊM NÚT CAMERA) */}
              <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  name="search"
                  placeholder="Tìm kiếm phụ kiện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />

                {/* Nút Tìm kiếm bằng Hình ảnh (AI) */}
                <button
                  type="button" // (Quan trọng: để không submit form)
                  className={styles.visualSearchButton}
                  onClick={() => setIsVisualSearchOpen(true)}
                  title="Tìm kiếm bằng hình ảnh"
                >
                  <FiCamera />
                </button>

                {/* Nút Tìm kiếm bằng Chữ */}
                <button type="submit" aria-label="Tìm kiếm">
                  <FiSearch />
                </button>
              </form>
              {/* ======================================= */}

              {/* (Kết quả tìm kiếm - Code đầy đủ 100% của bạn) */}
              {searchQuery.trim() && (
                <div className={styles.searchResults}>
                  {isSearching && searchResults.length === 0 && (
                    <div className={styles.searchLoader}>Đang tìm...</div>
                  )}

                  {searchResults.length > 0 &&
                    searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/product-${product.id}`}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setSearchResults([]);
                          setSearchQuery("");
                        }}
                      >
                        {(() => {
                          let firstImage =
                            (product.image_url && product.image_url[0]) || null;
                          if (firstImage) {
                            firstImage = firstImage.trimEnd();
                          }
                          const isValidUrl =
                            firstImage &&
                            (firstImage.startsWith("http") ||
                              firstImage.startsWith("/"));
                          return (
                            <Image
                              src={isValidUrl ? firstImage : "/placeholder.png"}
                              alt={product.name}
                              width={50}
                              height={50}
                              className={styles.searchResultImage}
                            />
                          );
                        })()}
                        <div className={styles.searchResultInfo}>
                          <HighlightMatch
                            text={product.name}
                            highlight={searchQuery}
                          />
                        </div>
                      </Link>
                    ))}

                  {!isSearching && searchResults.length === 0 && (
                    <div className={styles.noResults}>
                      Không tìm thấy sản phẩm nào.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              {/* === NÚT "SĂN XU" (VÒNG QUAY) === */}
              {isAuthenticated && ( // Chỉ hiện khi đã đăng nhập
                <Link href="/game" className={styles.gameLink}>
                  <FiGift size={20} />
                  <span>Săn Xu</span>
                </Link>
              )}
              {/* ======================================= */}

              {/* --- MENU TÀI KHOẢN --- */}
              {isAuthenticated ? (
                <div className={styles.userMenu} ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={styles.userMenuButton}
                  >
                    <FiUser size={24} />
                  </button>
                  <div
                    className={`${styles.userDropdown} ${
                      isUserMenuOpen ? styles.userDropdownOpen : ""
                    }`}
                  >
                    <span>Chào, {user?.name || user?.email}</span>
                    <Link href="/profile">Tài khoản của tôi</Link>
                    <button onClick={handleLogout}>Đăng xuất</button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className={styles.authLink}>
                  <FiUser size={24} />
                  <span>Tài khoản</span>
                </Link>
              )}

              {/* --- GIỎ HÀNG --- */}
              <div className={styles.cartIconWrapper} ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className={styles.cartButton}
                >
                  <FiShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className={styles.cartBadge}>{itemCount}</span>
                  )}
                  <span>Giỏ hàng</span>
                </button>
                {isCartOpen && (
                  <div className={styles.miniCart}>
                    <div className={styles.miniCartHeader}>
                      <h3>Giỏ hàng</h3>
                    </div>
                    {cartItems.length > 0 ? (
                      <>
                        <div className={styles.miniCartItems}>
                          {cartItems.map((item) => (
                            <div
                              key={item.product_id}
                              className={styles.miniCartItem}
                            >
                              <Image
                                src={item.image_url || "/placeholder.png"}
                                alt={item.name}
                                width={64}
                                height={64}
                                className={styles.itemImage}
                              />
                              <div className={styles.itemDetails}>
                                <p className={styles.itemName}>{item.name}</p>
                                <span className={styles.itemPrice}>
                                  {item.quantity} x{" "}
                                  {(
                                    item.discount_price || item.price
                                  ).toLocaleString("vi-VN")}{" "}
                                  ₫
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={styles.miniCartFooter}>
                          <div className={styles.subtotal}>
                            <span>Tạm tính:</span>
                            <span>{cartTotal.toLocaleString("vi-VN")} ₫</span>
                          </div>
                          <Link
                            href="/cart"
                            className={styles.viewCartButton}
                            onClick={() => setIsCartOpen(false)}
                          >
                            Xem giỏ hàng
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className={styles.emptyMessage}>
                        Giỏ hàng đang trống.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== THANH ĐIỀU HƯỚNG CHÍNH ===== */}
        <nav className={styles.navBar}>
          <div className={styles.navLinks}>
            <Link href="/home">Trang chủ</Link>
            <Link href="/products">Sản phẩm</Link>
            <Link href="/gift-box-builder" className={styles.giftBoxCta}>
              <FiGift />
              Tạo Hộp Quà
            </Link>
            <Link href="/blog">Tin tức</Link>
            <Link href="/about">Giới thiệu</Link>
            <Link href="/contact">Liên hệ</Link>
          </div>
        </nav>
      </header>
      {/* 6. ĐÃ THÊM MODAL AI VÀO ĐÂY */}
      {isVisualSearchOpen && (
        <VisualSearchModal onClose={() => setIsVisualSearchOpen(false)} />
      )}
    </>
  );
}
