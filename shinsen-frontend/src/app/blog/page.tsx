"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiClock, FiUser, FiTag, FiArrowRight, FiSearch } from "react-icons/fi";
import styles from "./BlogPage.module.css";

// --- DỮ LIỆU MẪU (MOCK DATA) ---
// Sau này bạn sẽ thay bằng API fetch từ backend
const MOCK_POSTS = [
  {
    id: 1,
    title: "Top 5 Xu Hướng Makeup 'Clean Girl' Năm 2024",
    excerpt:
      "Khám phá phong cách trang điểm tự nhiên, tôn vinh nét đẹp sẵn có đang làm mưa làm gió trên các nền tảng mạng xã hội...",
    author: "Thảo Vy",
    date: "18 Tháng 12, 2025",
    category: "Makeup",
    image: "/blog-1.jpg",
    slug: "xu-huong-makeup-clean-girl-2024",
    featured: true,
  },
  {
    id: 2,
    title: "Review Bộ Cọ Decharmix: Có Đáng Tiền?",
    excerpt:
      "Đánh giá chi tiết về chất lông, độ bám phấn và thiết kế của bộ cọ best-seller nhà Decharmix.",
    author: "Minh Anh",
    date: "15 Tháng 12, 2025",
    category: "Review",
    image: "/blog-2.jpg",
    slug: "review-bo-co-decharmix",
    featured: false,
  },
  {
    id: 3,
    title: "Gợi Ý Quà Tặng 8/3 Cho Nàng Thơ",
    excerpt:
      "Bí kíp chọn quà tặng vừa ý nghĩa, vừa tinh tế khiến phái đẹp xiêu lòng ngay từ cái nhìn đầu tiên.",
    author: "Team Decharmix",
    date: "10 Tháng 12, 2025",
    category: "Quà Tặng",
    image: "/blog-3.jpg",
    slug: "goi-y-qua-tang-8-3",
    featured: false,
  },
  {
    id: 4,
    title: "Skincare Mùa Hanh Khô: Những Điều Cần Biết",
    excerpt:
      "Da khô nứt nẻ làm lớp nền bị mốc? Xem ngay các tips cấp ẩm sâu để có làn da căng bóng.",
    author: "Dr. Skin",
    date: "05 Tháng 12, 2025",
    category: "Skincare",
    image: "/blog-4.jpg",
    slug: "skincare-mua-hanh-kho",
    featured: false,
  },
  {
    id: 5,
    title: "Cách Phối Màu Mắt Cho Người Mới Bắt Đầu",
    excerpt:
      "Hướng dẫn cơ bản cách phối màu mắt tone nâu tây và cam đào cực dễ thực hiện.",
    author: "Thảo Vy",
    date: "01 Tháng 12, 2025",
    category: "Makeup",
    image: "/blog-5.jpg",
    slug: "cach-phoi-mau-mat-basic",
    featured: false,
  },
];

const CATEGORIES = ["Tất cả", "Makeup", "Skincare", "Review", "Quà Tặng"];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  // Lọc bài viết
  const filteredPosts =
    activeCategory === "Tất cả"
      ? MOCK_POSTS
      : MOCK_POSTS.filter((post) => post.category === activeCategory);

  // Tách bài nổi bật (Featured) và bài thường
  const featuredPost =
    filteredPosts.find((p) => p.featured) || filteredPosts[0];
  const otherPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className={styles.pageWrapper}>
      {/* Header Section */}
      <header className={styles.header}>
        <span className={styles.subTitle}>Decharmix Blog</span>
        <h1 className={styles.title}>Góc Chia Sẻ & Làm Đẹp</h1>
        <p className={styles.description}>
          Nơi cập nhật xu hướng, bí kíp làm đẹp và những câu chuyện thú vị từ
          chúng mình.
        </p>

        {/* Search Bar (Optional) */}
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input type="text" placeholder="Tìm kiếm bài viết..." />
        </div>
      </header>

      {/* Category Filter */}
      <div className={styles.categoryBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.catButton} ${
              activeCategory === cat ? styles.active : ""
            }`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.contentContainer}>
        {/* Featured Post Section */}
        {featuredPost && (
          <section className={styles.featuredSection}>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className={styles.featuredCard}
            >
              <div className={styles.featuredImageWrapper}>
                <Image
                  src={featuredPost.image || "/placeholder.png"}
                  alt={featuredPost.title}
                  fill
                  style={{ objectFit: "cover" }}
                  className={styles.imageZoom}
                />
                <span className={styles.featuredTag}>Nổi bật</span>
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.metaTags}>
                  <span className={styles.categoryTag}>
                    <FiTag /> {featuredPost.category}
                  </span>
                  <span className={styles.dateTag}>
                    <FiClock /> {featuredPost.date}
                  </span>
                </div>
                <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                <div className={styles.authorRow}>
                  <div className={styles.authorAvatar}>
                    <FiUser />
                  </div>
                  <span>{featuredPost.author}</span>
                  <span className={styles.readMore}>
                    Đọc tiếp <FiArrowRight />
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Grid Posts Section */}
        <section className={styles.gridSection}>
          {otherPosts.length > 0 ? (
            otherPosts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.id}
                className={styles.postCard}
              >
                <div className={styles.cardImageWrapper}>
                  <Image
                    src={post.image || "/placeholder.png"}
                    alt={post.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <span className={styles.cardCategory}>{post.category}</span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span>{post.date}</span> • <span>{post.author}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>
                    {post.excerpt.substring(0, 80)}...
                  </p>
                  <span className={styles.cardLink}>
                    Xem chi tiết <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Chưa có bài viết nào thuộc danh mục này.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
