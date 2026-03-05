"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiHeart, FiPackage, FiAward } from "react-icons/fi";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./Home.module.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// --- XỬ LÝ URL AN TOÀN TUYỆT ĐỐI ---
const rawUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://shinsen-backend-api.onrender.com";
const API_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

// --- Interfaces ---
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string[] | null;
  discount_price?: number;
  end_date?: string;
  category?: string;
}

// --- Component Card Sản phẩm ---
const ProductCard = ({
  product,
  index,
}: {
  product: Product;
  index: number;
}) => {
  const displayPrice = product.discount_price || product.price;
  const firstImage =
    product.image_url && product.image_url.length > 0
      ? product.image_url[0].trim()
      : "/placeholder.png";

  const isValidUrl =
    firstImage.startsWith("http") || firstImage.startsWith("/");

  return (
    <motion.div
      className={styles.productCard}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className={styles.productImageWrapper}>
        <Link href={`/products/product-${product.id}`}>
          <Image
            src={isValidUrl ? firstImage : "/placeholder.png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className={styles.productImage}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
      </div>
      <div className={styles.productContent}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>
          <span className={styles.currentPrice}>
            {Number(displayPrice).toLocaleString("vi-VN")} ₫
          </span>
          {product.discount_price && product.discount_price < product.price && (
            <span className={styles.originalPrice}>
              {Number(product.price).toLocaleString("vi-VN")} ₫
            </span>
          )}
        </p>
        <Link
          href={`/products/product-${product.id}`}
          className={styles.productButton}
        >
          Xem chi tiết
        </Link>
      </div>
    </motion.div>
  );
};

// --- Component Đếm ngược ---
const CountdownTimer = ({ endDate }: { endDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timerFunc = setInterval(() => {
      const difference = +endDate - +new Date();
      if (difference <= 0) {
        clearInterval(timerFunc);
      } else {
        setTimeLeft({
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timerFunc);
  }, [endDate]);

  return (
    <div className={styles.countdownTimer}>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>
        <small>Giờ</small>
      </div>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
        <small>Phút</small>
      </div>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
        <small>Giây</small>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { isAuthenticated, token } = useAuth();
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [dealProduct, setDealProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const heroSlides = [
    {
      imageUrl: "/hero-handmade-1.jpg",
      title: "Vẻ Đẹp Tinh Tế",
      subtitle: "Khám phá bộ sưu tập charm và vòng tay thiết kế độc quyền.",
      href: "/products",
    },
    {
      imageUrl: "/hero-handmade-2.jpg",
      title: "Quà Tặng Từ Trái Tim",
      subtitle: "Trao gửi yêu thương qua những món quà handmade ý nghĩa.",
      href: "/products?category=COMBO QUA TANG",
    },
    {
      imageUrl: "/hero-handmade-3.jpg",
      title: "Dấu Ấn Cá Nhân",
      subtitle: "Thiết kế vòng tay theo tên và phong cách của riêng bạn.",
      href: "/products?category=VONG TAY",
    },
  ];

  const categories = [
    {
      name: "Vòng Tay",
      imageUrl: "/27.png",
      href: "/products?category=VONG TAY",
    },
    {
      name: "Dây Đeo",
      imageUrl: "/28.png",
      href: "/products?category=DAY CHUYEN",
    },
    {
      name: "Phụ Kiện Tùy Chỉnh",
      imageUrl: "/29.png",
      href: "/products?category=PHU KIEN TOC",
    },
  ];

  const gameHub = [
    {
      title: "Vòng Quay May Mắn",
      description: "Quay liền tay, rinh ngay Xu!",
      imageUrl: "/33.png",
      href: "/game/lucky-wheel",
    },
    {
      title: "Đập Hộp Quà",
      description: "Mở hộp quà bí ẩn, 100% trúng thưởng.",
      imageUrl: "/34.png",
      href: "/game/gift-box",
    },
    {
      title: "Lật Hình Trí Nhớ",
      description: "Thắng game nhận thưởng!",
      imageUrl: "/35.png",
      href: "/game/memory-match",
    },
    {
      title: "Săn Charm",
      description: "Nhanh tay click, né bom!",
      imageUrl: "/36.png",
      href: "/game/whac-a-charm",
    },
    {
      title: "Charm Nhảy",
      description: "Vượt ải nhận xu thưởng!",
      imageUrl: "/37.png",
      href: "/game/charm-jump",
    },
    {
      title: "Chém Charm",
      description: "Cắt hoa né bom cực đã!",
      imageUrl: "/38.png",
      href: "/game/charm-slice",
    },
  ];

  // Fetch dữ liệu công khai (New, Bestseller, Deal)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [newRes, bestRes, dealRes] = await Promise.all([
          fetch(`${API_URL}/api/products?filter=new&limit=4`),
          fetch(`${API_URL}/api/products?filter=bestseller&limit=4`),
          fetch(`${API_URL}/api/products/deal-of-the-day`),
        ]);

        if (newRes.ok) {
          const d = await newRes.json();
          setNewProducts(
            Array.isArray(d.products) ? d.products : Array.isArray(d) ? d : [],
          );
        }
        if (bestRes.ok) {
          const d = await bestRes.json();
          setBestSellers(
            Array.isArray(d.products) ? d.products : Array.isArray(d) ? d : [],
          );
        }
        if (dealRes.ok) {
          const d = await dealRes.json();
          setDealProduct(d);
        }
      } catch (error) {
        console.error("Lỗi fetch trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch dữ liệu cá nhân hóa (For You)
  useEffect(() => {
    if (isAuthenticated && token) {
      fetch(`${API_URL}/api/products/for-you`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setForYouProducts(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Lỗi fetch For You:", err));
    }
  }, [isAuthenticated, token]);

  return (
    <div className={styles.pageWrapper}>
      <main>
        {/* SECTION 1: HERO SLIDER */}
        <section className={styles.heroSection}>
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            loop
            autoplay={{ delay: 3500 }}
            pagination={{ clickable: true }}
            className={styles.heroSwiper}
          >
            {heroSlides.map((slide, i) => (
              <SwiperSlide key={i}>
                <div className={styles.slideContent}>
                  <div
                    className={styles.slideBackground}
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                  />
                  <div className={styles.slideOverlay} />
                  <div className={styles.slideText}>
                    <h1 className={styles.slideTitle}>{slide.title}</h1>
                    <p className={styles.slideSubtitle}>{slide.subtitle}</p>
                    <Link href={slide.href} className={styles.slideButton}>
                      Khám Phá Ngay
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* SECTION 2: COMMITMENTS */}
        <section className={`${styles.container} ${styles.commitmentsSection}`}>
          <div className={styles.commitmentsGrid}>
            <div className={styles.commitmentItem}>
              <FiHeart className={styles.commitmentIcon} />
              <h3>Thiết Kế Độc Quyền</h3>
              <p>Làm thủ công với tình yêu</p>
            </div>
            <div className={styles.commitmentItem}>
              <FiAward className={styles.commitmentIcon} />
              <h3>Chất Liệu Cao Cấp</h3>
              <p>Bền đẹp theo thời gian</p>
            </div>
            <div className={styles.commitmentItem}>
              <FiPackage className={styles.commitmentIcon} />
              <h3>Gói Quà Miễn Phí</h3>
              <p>Chăm chút từng đơn hàng</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: CATEGORIES */}
        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                href={cat.href}
                key={cat.name}
                className={styles.categoryCard}
              >
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  width={400}
                  height={500}
                  className={styles.categoryImage}
                />
                <div className={styles.categoryOverlay}>
                  <h3>{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 4: DEAL OF THE DAY */}
        {dealProduct && (
          <section
            className={`${styles.container} ${styles.section} ${styles.bgPink}`}
          >
            <h2 className={styles.sectionTitle}>Ưu Đãi Đặc Biệt</h2>
            <div className={styles.dealGrid}>
              <div className={styles.dealImageWrapper}>
                <Image
                  src={
                    (dealProduct.image_url && dealProduct.image_url[0]) ||
                    "/placeholder.png"
                  }
                  alt={dealProduct.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.dealContent}>
                <h2 className={styles.dealTitle}>{dealProduct.name}</h2>
                <div className={styles.dealPrices}>
                  <span className={styles.dealSalePrice}>
                    {Number(dealProduct.discount_price).toLocaleString()} ₫
                  </span>
                  <span className={styles.dealOriginalPrice}>
                    {Number(dealProduct.price).toLocaleString()} ₫
                  </span>
                </div>
                <CountdownTimer
                  endDate={
                    new Date(dealProduct.end_date || Date.now() + 86400000)
                  }
                />
                <Link
                  href={`/products/product-${dealProduct.id}`}
                  className={styles.dealButton}
                >
                  Săn Deal Ngay
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: GAME HUB */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Góc Săn Thưởng</h2>
          <div className={styles.gameGrid}>
            {gameHub.map((game, i) => (
              <div key={i} className={styles.gameCard}>
                <div className={styles.gameImageWrapper}>
                  <Image
                    src={game.imageUrl}
                    alt={game.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.gameContent}>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <Link href={game.href} className={styles.gameButton}>
                    Chơi Ngay
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: FOR YOU (AI Recommendations) */}
        {isAuthenticated && forYouProducts.length > 0 && (
          <section
            className={`${styles.container} ${styles.section} ${styles.bgPink}`}
          >
            <h2 className={styles.sectionTitle}>✨ Dành Riêng Cho Bạn</h2>
            <div className={styles.productGrid}>
              {forYouProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: NEW ARRIVALS */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Hàng Mới Về</h2>
          <div className={styles.productGrid}>
            {newProducts.length > 0 ? (
              newProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            ) : (
              <div className={styles.emptyState}>
                Đang cập nhật sản phẩm mới...
              </div>
            )}
          </div>
        </section>

        {/* SECTION 8: BEST SELLERS */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Sản Phẩm Nổi Bật</h2>
          <div className={styles.productGrid}>
            {bestSellers.length > 0 ? (
              bestSellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))
            ) : (
              <div className={styles.emptyState}>
                Đang cập nhật sản phẩm nổi bật...
              </div>
            )}
          </div>
        </section>

        {/* SECTION 9: NEWSLETTER */}
        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.newsletterSection}>
            <h2 className={styles.sectionTitle}>Nhận Ưu Đãi Đặc Biệt</h2>
            <p>Đăng ký email để nhận ngay voucher giảm giá 10%.</p>
            <form
              className={styles.newsletterForm}
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="Email của bạn..." required />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
