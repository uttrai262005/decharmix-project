"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiHeart, FiPackage, FiAward, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useAuth } from "@/contexts/AuthContext";
// Import CSS Module mới
import styles from "./Home.module.css";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
// --- Định nghĩa kiểu dữ liệu (Interfaces) ---
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string[] | null;
  discount_price?: number;
  // API của deal hot cần trả về end_date
  end_date?: string;
}

interface BlogPost {
  id: number;
  title: string;
  category: string;
  image_url: string; // Giả sử API blog trả về 1 ảnh
  href: string; // Hoặc 'slug'
}

// --- Component Card Sản phẩm (dùng nội bộ) ---
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
      ? product.image_url[0].trimEnd() // Lọc link rác
      : "/placeholder.png";

  const isValidUrl =
    firstImage.startsWith("http") || firstImage.startsWith("/");

  return (
    <motion.div
      className={styles.productCard}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className={styles.productImageWrapper}>
        <Link href={`/products/product-${product.id}`}>
          <Image
            src={isValidUrl ? firstImage : "/placeholder.png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className={styles.productImage}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
      </div>
      <div className={styles.productContent}>
        <h3 className={styles.productName}>{product.name}</h3>
        <p className={styles.productPrice}>
          {displayPrice.toLocaleString("vi-VN")} ₫
          {product.discount_price && (
            <span className={styles.originalPrice}>
              {product.price.toLocaleString("vi-VN")} ₫
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

// --- Component Đếm ngược (Giữ lại từ code cũ của bạn) ---
const CountdownTimer = ({ endDate }: { endDate: Date }) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const calculateTimeLeft = () => {
    const difference = +endDate - +new Date();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearTimeout(timer);
  }, [isClient, timeLeft]);

  if (!isClient) {
    return (
      <div className={styles.countdownTimer}>
        <div className={styles.timeBlock}>
          <span>--</span>
          <span>Giờ</span>
        </div>
        <div className={styles.timeBlock}>
          <span>--</span>
          <span>Phút</span>
        </div>
        <div className={styles.timeBlock}>
          <span>--</span>
          <span>Giây</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.countdownTimer}>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.hours).padStart(2, "0")}</span>
        <span>Giờ</span>
      </div>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span>Phút</span>
      </div>
      <div className={styles.timeBlock}>
        <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span>Giây</span>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH TRANG CHỦ ---
export default function HomePage() {
  const { isAuthenticated, token } = useAuth();
  const [forYouProducts, setForYouProducts] = useState<Product[]>([]);
  // === DỮ LIỆU ĐỘNG TỪ API ===
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [dealProduct, setDealProduct] = useState<Product | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // === DỮ LIỆU TĨNH ===
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
      imageUrl: "/category-vong-tay.jpg",
      href: "/products?category=VONG TAY",
    },
    {
      name: "Dây Chuyền",
      imageUrl: "/category-day-chuyen.jpg",
      href: "/products?category=DAY CHUYEN",
    },
    {
      name: "Phụ Kiện Tóc",
      imageUrl: "/category-phu-kien-toc.jpg",
      href: "/products?category=PHU KIEN TOC",
    },
  ];

  // === DỮ LIỆU MỚI: KHU VỰC GAME ===
  const gameHub = [
    {
      title: "Vòng Quay May Mắn",
      description: "Quay liền tay, rinh ngay Xu và voucher giảm giá!",
      imageUrl: "/game-banner-lucky-wheel.jpg", // <-- Bạn cần tạo ảnh này
      href: "/game/lucky-wheel",
    },
    {
      title: "Đập Hộp Quà",
      description: "Mở hộp quà bí ẩn, 100% trúng thưởng độc quyền.",
      imageUrl: "/game-banner-gift-box.jpg", // <-- Bạn cần tạo ảnh này
      href: "/game/gift-box",
    },
    {
      title: "Lật Hình Trí Nhớ", // <-- Đổi tên
      description: "Thử thách trí nhớ, thắng game trong 60s nhận thưởng!", // <-- Đổi mô tả
      imageUrl: "/game-banner-memory-match.jpg", // <-- Tạo ảnh banner mới
      href: "/game/memory-match", // <-- SỬA Ở ĐÂY
    },
    {
      title: "Săn Charm Nhanh Tay",
      description: "Click 15 charm trong 30s. Cẩn thận bom!",
      imageUrl: "/game-banner-whac-a-charm.jpg", // <-- Tạo ảnh banner mới
      href: "/game/whac-a-charm",
    },
    {
      title: "Charm Nhảy Vượt Ải",
      description: "Né bom, ăn 10 xu trong 45 giây để thắng!",
      imageUrl: "/game-banner-charm-jump.jpg", // <-- Tạo ảnh banner mới
      href: "/game/charm-jump",
    },
    {
      title: "Chém Charm Né Bom",
      description: "Chém 20 charm. Đừng chém bom hoặc để lỡ 3 charm!",
      imageUrl: "/game-banner-charm-slice.jpg", // <-- Tạo ảnh banner mới
      href: "/game/charm-slice",
    },
  ];
  // =================================

  // === GỌI API KHI TẢI TRANG ===
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setIsLoading(true);
        // (Chạy API công khai song song)
        const [newRes, bestRes, dealRes, blogRes] = await Promise.all([
          fetch(`${API_URL}/api/products?filter=new&limit=4`),
          fetch(`${API_URL}/api/products?filter=bestseller&limit=4`),
          fetch(`${API_URL}/api/products/deal-of-the-day`),
          fetch(`${API_URL}/api/blog?limit=3`),
        ]);

        if (newRes.ok) setNewProducts((await newRes.json()).products || []);
        if (bestRes.ok) setBestSellers((await bestRes.json()).products || []);
        if (dealRes.ok) setDealProduct(await dealRes.json());
        if (blogRes.ok) setBlogPosts(await blogRes.json());
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ (công khai):", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicData();
  }, []); // (Chỉ chạy 1 lần)

  // (useEffect 2: Tải dữ liệu AI "FOR YOU" nếu đã đăng nhập)
  useEffect(() => {
    const fetchForYouData = async () => {
      // (Chỉ chạy nếu user đã đăng nhập VÀ có token)
      if (isAuthenticated && token) {
        try {
          const res = await fetch(`${API_URL}/api/products/for-you`, {
            headers: {
              Authorization: `Bearer ${token}`, // (Gửi token xác thực)
            },
          });
          if (res.ok) {
            const data = await res.json();
            setForYouProducts(data || []);
          }
        } catch (error) {
          console.error("Lỗi khi tải gợi ý 'For You':", error);
        }
      }
    };
    fetchForYouData();
  }, [isAuthenticated, token]); // (Chạy lại khi trạng thái đăng nhập thay đổi)

  return (
    <div className={styles.pageWrapper}>
      <main>
        {/* ===== 1. HERO SLIDER (3 Banner) ===== */}
        <section className={styles.heroSection}>
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className={styles.heroSwiper}
          >
            {heroSlides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className={styles.slideContent}>
                  <div
                    className={styles.slideBackground}
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                  />
                  <div className={styles.slideOverlay} />
                  <motion.div
                    className={styles.slideText}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <h1 className={styles.slideTitle}>{slide.title}</h1>
                    <p className={styles.slideSubtitle}>{slide.subtitle}</p>
                    <Link href={slide.href} className={styles.slideButton}>
                      Khám Phá Ngay
                    </Link>
                  </motion.div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* ===== 2. CAM KẾT THƯƠNG HIỆU ===== */}
        <section className={`${styles.container} ${styles.commitmentsSection}`}>
          <div className={styles.commitmentsGrid}>
            <motion.div
              className={styles.commitmentItem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FiHeart className={styles.commitmentIcon} />
              <h3 className={styles.commitmentTitle}>Thiết Kế Độc Quyền</h3>
              <p>Sản phẩm được làm thủ công với tình yêu và sự tỉ mỉ.</p>
            </motion.div>
            <motion.div
              className={styles.commitmentItem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FiAward className={styles.commitmentIcon} />
              <h3 className={styles.commitmentTitle}>Chất Liệu Cao Cấp</h3>
              <p>Chỉ sử dụng vật liệu an toàn, bền đẹp theo thời gian.</p>
            </motion.div>
            <motion.div
              className={styles.commitmentItem}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FiPackage className={styles.commitmentIcon} />
              <h3 className={styles.commitmentTitle}>Gói Quà Miễn Phí</h3>
              <p>Mỗi đơn hàng đều được gói cẩn thận như một món quà.</p>
            </motion.div>
          </div>
        </section>

        {/* ===== 3. DANH MỤC NỔI BẬT ===== */}
        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                className={styles.categoryCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={cat.href}>
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={400}
                    height={500}
                    style={{ objectFit: "cover" }}
                    className={styles.categoryImage}
                  />
                  <div className={styles.categoryOverlay}>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <span className={styles.categoryButton}>Xem Ngay</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== 4. DEAL HOT TRONG TUẦN ===== */}
        {isLoading && !dealProduct ? (
          <div className={styles.loadingPlaceholder}>Đang tải ưu đãi...</div>
        ) : dealProduct ? (
          <section
            className={`${styles.container} ${styles.section} ${styles.bgPink}`}
          >
            <h2 className={styles.sectionTitle}>Ưu Đãi Đặc Biệt</h2>
            <div className={styles.dealGrid}>
              <motion.div
                className={styles.dealImageWrapper}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <Image
                  src={
                    (dealProduct.image_url && dealProduct.image_url[0]) ||
                    "/placeholder.png"
                  }
                  alt={dealProduct.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="50vw"
                />
              </motion.div>
              <motion.div
                className={styles.dealContent}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <h2 className={styles.dealTitle}>{dealProduct.name}</h2>
                <div className={styles.dealPrices}>
                  <span className={styles.dealSalePrice}>
                    {dealProduct.discount_price?.toLocaleString("vi-VN")} ₫
                  </span>
                  <span className={styles.dealOriginalPrice}>
                    {dealProduct.price.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className={styles.countdownWrapper}>
                  <p>Ưu đãi kết thúc sau:</p>
                  <CountdownTimer
                    endDate={
                      new Date(dealProduct.end_date || Date.now() + 86400000)
                    }
                  />
                </div>
                <Link
                  href={`/products/product-${dealProduct.id}`}
                  className={styles.dealButton}
                >
                  Săn Deal Ngay
                </Link>
              </motion.div>
            </div>
          </section>
        ) : null}

        {/* ===== 5. GÓC SĂN THƯỞNG (TRÒ CHƠI) - MỚI ===== */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Góc Săn Thưởng</h2>
          <div className={styles.gameGrid}>
            {gameHub.map((game, index) => (
              <motion.div
                key={index}
                className={styles.gameCard}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={styles.gameImageWrapper}>
                  <Image
                    src={game.imageUrl}
                    alt={game.title}
                    fill
                    style={{ objectFit: "cover" }}
                    className={styles.gameImage}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className={styles.gameContent}>
                  <h3 className={styles.gameTitle}>{game.title}</h3>
                  <p className={styles.gameDescription}>{game.description}</p>
                  <Link
                    href={game.href}
                    className={`${styles.gameButton} ${
                      game.href === "#" ? styles.gameButtonDisabled : ""
                    }`}
                  >
                    {game.href === "#" ? "Sắp ra mắt" : "Chơi Ngay"}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
        {/* =========================================== */}
        {isAuthenticated && forYouProducts.length > 0 && (
          <section
            className={`${styles.container} ${styles.section} ${styles.bgPink}`}
          >
            <h2 className={styles.sectionTitle}>✨ Dành Riêng Cho Bạn</h2>
            <div className={styles.productGrid}>
              {forYouProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ===== 6. SẢN PHẨM MỚI VỀ ===== */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Hàng Mới Về</h2>
          {isLoading ? (
            <div className={styles.loadingPlaceholder}>
              Đang tải sản phẩm...
            </div>
          ) : (
            <div className={styles.productGrid}>
              {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ===== 7. GÓC SÁNG TẠO (BLOG) ===== */}
        <section
          className={`${styles.container} ${styles.section} ${styles.bgPink}`}
        >
          <h2 className={styles.sectionTitle}>Góc Sáng Tạo Decharmix</h2>
          {isLoading ? (
            <div className={styles.loadingPlaceholder}>
              Đang tải bài viết...
            </div>
          ) : (
            <>
              <div className={styles.blogGrid}>
                {blogPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    className={styles.blogCard}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className={styles.blogImageWrapper}>
                      <Image
                        src={post.image_url || "/placeholder.png"}
                        alt={post.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="50vw"
                      />
                    </div>
                    <div className={styles.blogContent}>
                      <p className={styles.blogCategory}>{post.category}</p>
                      <h3 className={styles.blogTitle}>{post.title}</h3>
                      <Link
                        href={`/blog/${post.href}`}
                        className={styles.blogLink}
                      >
                        Đọc tiếp <FiArrowRight />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ===== 8. SẢN PHẨM BÁN CHẠY ===== */}
        <section className={`${styles.container} ${styles.section}`}>
          <h2 className={styles.sectionTitle}>Sản Phẩm Nổi Bật</h2>
          {isLoading ? (
            <div className={styles.loadingPlaceholder}>
              Đang tải sản phẩm...
            </div>
          ) : (
            <div className={styles.productGrid}>
              {bestSellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* ===== 9. NEWSLETTER ===== */}
        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.newsletterSection}>
            <h2 className={styles.sectionTitle}>Nhận Ưu Đãi Đặc Biệt</h2>
            <p>
              Đăng ký email để nhận ngay voucher giảm giá 10% cho đơn hàng đầu
              tiên.
            </p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Email của bạn..." required />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
