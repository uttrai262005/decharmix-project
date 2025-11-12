"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { FiShoppingCart, FiSearch, FiUser } from "react-icons/fi";
import styles from "./Header.module.css";

// Interface và Component HighlightMatch giữ nguyên
interface SearchResult {
  id: number;
  name: string;
  image_url: string[] | null;
}
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
  const { itemCount } = useCart();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Logic tìm kiếm không thay đổi
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/products/search?q=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => setSearchResults(data))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Logic đóng khi click ra ngoài không thay đổi
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
    }
  };

  return (
    <header className={styles.headerWrapper}>
      {/* ... Giữ nguyên topBar và mainHeader ... */}
      <div className={styles.mainHeader}>
        <div className={styles.mainHeaderContent}>
          <Link href="/" className={styles.logo}>
            Shinsen
          </Link>
          <div className={styles.searchContainer} ref={searchRef}>
            <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                name="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" aria-label="Tìm kiếm">
                <FiSearch />
              </button>
            </form>

            {/* ===== BẮT ĐẦU NÂNG CẤP LOGIC HIỂN THỊ ===== */}
            {searchQuery.trim() && (
              <div className={styles.searchResults}>
                {/* Chỉ hiện "Đang tìm..." khi đang tìm VÀ chưa có kết quả nào */}
                {isSearching && searchResults.length === 0 && (
                  <div className={styles.searchLoader}>Đang tìm...</div>
                )}

                {/* Luôn hiển thị kết quả đã có, kể cả khi đang tìm kiếm tiếp */}
                {searchResults.length > 0 &&
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/product-${product.id}`}
                      className={styles.searchResultItem}
                      onClick={() => setSearchResults([])}
                    >
                      <Image
                        src={
                          (product.image_url && product.image_url[0]) ||
                          "/placeholder.png"
                        }
                        alt={product.name}
                        width={50}
                        height={50}
                        className={styles.searchResultImage}
                      />
                      <div className={styles.searchResultInfo}>
                        <HighlightMatch
                          text={product.name}
                          highlight={searchQuery}
                        />
                      </div>
                    </Link>
                  ))}

                {/* Chỉ hiện "Không có kết quả" khi đã tìm xong và không có gì */}
                {!isSearching && searchResults.length === 0 && (
                  <div className={styles.noResults}>
                    Không tìm thấy sản phẩm nào.
                  </div>
                )}
              </div>
            )}
            {/* ===== KẾT THÚC NÂNG CẤP ===== */}
          </div>
          {/* ... Giữ nguyên phần actions ... */}
          <div className={styles.actions}>{/* Tài khoản và Giỏ hàng */}</div>
        </div>
      </div>
      {/* ... Giữ nguyên navBar ... */}
    </header>
  );
}
