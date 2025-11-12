import Image from "next/image";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";
import styles from "./Post.module.css";

// Hàm để lấy dữ liệu bài viết theo slug
async function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

// Props cho page component
type PostPageProps = {
  params: { slug: string };
};

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className={styles.postContainer}>
      <header className={styles.postHeader}>
        <p className={styles.postCategory}>{post.category}</p>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postMeta}>
          Bởi {post.author} • {post.date}
        </p>
      </header>

      <div className={styles.postImageWrapper}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div
        className={styles.postContent}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
