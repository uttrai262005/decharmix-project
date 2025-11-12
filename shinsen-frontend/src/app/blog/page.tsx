import Link from "next/link";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi"; // Dòng import quan trọng đã được thêm vào
import { posts } from "@/data/posts";
import styles from "./Blog.module.css";

export default function BlogPage() {
  return (
    <div>
      <header className={styles.pageHeader}>
        <h1 className={styles.title}>Góc Bếp Shinsen</h1>
        <p className={styles.subtitle}>
          Khám phá công thức, mẹo vặt và câu chuyện về thực phẩm sạch
        </p>
      </header>

      <div className={styles.postsGrid}>
        {posts.map((post) => (
          <Link
            href={`/blog/${post.slug}`}
            key={post.slug}
            className={styles.postCard}
          >
            <div className={styles.cardImageWrapper}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="50vw"
              />
            </div>
            <div className={styles.cardContent}>
              <p className={styles.cardCategory}>{post.category}</p>
              <h2 className={styles.cardTitle}>{post.title}</h2>
              <p className={styles.cardSummary}>{post.summary}</p>
              <span className={styles.cardReadMore}>
                Đọc tiếp <FiArrowRight className="ml-2" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
