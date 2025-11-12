"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiChevronRight,
  FiSunrise,
  FiTruck,
  FiHeart,
} from "react-icons/fi";
import Image from "next/image";

// DỮ LIỆU MẪU
const allPosts = [
  {
    id: 1,
    category: "Nông sản",
    title: "Bí quyết chọn dâu tây Đà Lạt tươi ngon, mọng nước",
    excerpt:
      "Khám phá cách nhận biết những trái dâu tây chín mọng, không hóa chất ngay tại vườn Shinsen...",
    imageUrl: "/blog/post-1.jpg",
    author: "Uyên Nhi",
    authorAvatar: "/blog/author-1.jpg",
    date: "15 Tháng 9, 2025",
  },
  {
    id: 2,
    category: "Hải sản",
    title: "Tôm hùm Alaska: Bí mật từ những vùng biển lạnh giá",
    excerpt:
      "Hành trình của những con tôm hùm Alaska chất lượng nhất, từ đại dương đến bàn ăn của bạn...",
    imageUrl: "/blog/post-2.jpg",
    author: "Trần Bách",
    authorAvatar: "/blog/author-1.jpg",
    date: "10 Tháng 9, 2025",
  },
  {
    id: 3,
    category: "Công thức",
    title: "Salad bơ và cải xoăn: Bữa ăn detox hoàn hảo",
    excerpt:
      "Một công thức đơn giản nhưng đầy dinh dưỡng, giúp bạn thanh lọc cơ thể và tái tạo năng lượng...",
    imageUrl: "/blog/post-3.jpg",
    author: "Lê An",
    authorAvatar: "/blog/author-1.jpg",
    date: "05 Tháng 9, 2025",
  },
  {
    id: 4,
    category: "Nông sản",
    title: "Măng tây xanh: Siêu thực phẩm cho sức khỏe",
    excerpt:
      "Tìm hiểu về những lợi ích tuyệt vời của măng tây và cách chế biến để giữ trọn dinh dưỡng...",
    imageUrl: "/blog/post-4.jpg",
    author: "An Nguyễn",
    authorAvatar: "/blog/author-1.jpg",
    date: "28 Tháng 8, 2025",
  },
  {
    id: 5,
    category: "Câu chuyện",
    title: "Người nông dân Shinsen: Gìn giữ giá trị bền vững",
    excerpt:
      "Gặp gỡ những con người thầm lặng đứng sau sự tươi ngon của mỗi sản phẩm Shinsen...",
    imageUrl: "/blog/post-5.jpg",
    author: "Minh Đức",
    authorAvatar: "/blog/author-1.jpg",
    date: "22 Tháng 8, 2025",
  },
  {
    id: 6,
    category: "Hải sản",
    title: "Cá hồi Na Uy: Hành trình đến độ tươi hoàn hảo",
    excerpt:
      "Quy trình vận chuyển và bảo quản cá hồi Na Uy độc quyền tại Shinsen, đảm bảo chất lượng tuyệt đối...",
    imageUrl: "/blog/post-6.jpg",
    author: "Trần Bách",
    authorAvatar: "/blog/author-1.jpg",
    date: "15 Tháng 8, 2025",
  },
];

const categories = [
  "Tất cả",
  ...Array.from(new Set(allPosts.map((p) => p.category))),
];

// --- Component Card Bài viết ---
const ArticleCard = ({ post }: { post: (typeof allPosts)[0] }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="bg-white rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
  >
    <div className="overflow-hidden h-56 flex-shrink-0">
      <Image
        src={post.imageUrl}
        alt={post.title}
        width={400}
        height={300}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <p className="text-sm font-semibold text-green-600 mb-2">
        {post.category}
      </p>
      <h3 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{post.excerpt}</p>
      <div className="border-t pt-4 flex justify-between items-center text-sm text-gray-500 mt-auto">
        <div className="flex items-center">
          <FiCalendar className="mr-2" />
          <span>{post.date}</span>
        </div>
        <a
          href="#"
          className="flex items-center text-green-600 font-semibold hover:underline"
        >
          Đọc tiếp <FiChevronRight className="ml-1" />
        </a>
      </div>
    </div>
  </motion.div>
);

// --- Component "Giá trị cốt lõi" (THIẾT KẾ MỚI) ---
const CoreValue = ({ icon, title, children }: any) => (
  <motion.div
    className="text-center p-6"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-5 shadow-lg">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-green-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{children}</p>
  </motion.div>
);

// --- Component Trang Tin Tức ---
export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const filteredPosts = useMemo(() => {
    return allPosts.filter(
      (post) =>
        selectedCategory === "Tất cả" || post.category === selectedCategory
    );
  }, [selectedCategory]);

  const featuredPost = allPosts[0];

  return (
    <div className="bg-white">
      <main className="pt-20">
        {/* ===== PHẦN HERO ===== */}
        <section className="relative h-[600px] text-white flex items-end p-12">
          <div className="absolute inset-0">
            <Image
              src={featuredPost.imageUrl}
              alt={featuredPost.title}
              layout="fill"
              objectFit="cover"
              className="brightness-50"
            />
          </div>
          <div className="relative z-10 container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="sua1 text-lg font-semibold text-green-300">
                {featuredPost.category}
              </p>
              <h1 className="sua1 text-5xl font-bold max-w-3xl mt-2 leading-tight">
                {featuredPost.title}
              </h1>
              <div className="sua1 flex items-center mt-6 text-gray-200">
                <Image
                  src={featuredPost.authorAvatar}
                  alt={featuredPost.author}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <p className="font-semibold">{featuredPost.author}</p>
                  <p>{featuredPost.date}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== PHẦN GIÁ TRỊ CỐT LÕI ===== */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="sua2 text-4xl font-bold text-green-800">
                Cam kết từ Shinsen
              </h2>
              <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                Những giá trị cốt lõi làm nên sự khác biệt trong từng sản phẩm
                tươi ngon của chúng tôi.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              <CoreValue icon={<FiSunrise size={28} />} title="Tươi & Sạch">
                100% sản phẩm hữu cơ, đạt chuẩn VietGAP, giữ trọn vị ngon nguyên
                bản.
              </CoreValue>
              <CoreValue icon={<FiTruck size={28} />} title="Minh bạch">
                Mỗi sản phẩm đều có mã QR để truy xuất nguồn gốc tận trang trại.
              </CoreValue>
              <CoreValue icon={<FiHeart size={28} />} title="Bền vững">
                Canh tác có trách nhiệm, bảo vệ môi trường và hỗ trợ nông dân
                địa phương.
              </CoreValue>
            </div>
          </div>
        </section>

        {/* ===== PHẦN DANH SÁCH BÀI VIẾT & LỌC (THIẾT KẾ MỚI) ===== */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="sua2 text-4xl font-bold text-gray-800">
                Khám phá tin tức
              </h2>
            </div>

            {/* SỬA LỖI: Tăng khoảng cách `gap-4` và căn giữa `justify-center` */}
            <div className="sua2 flex flex-wrap gap-4 justify-center mb-12">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  // SỬA LỖI: Bỏ viền đen, thay bằng đổ bóng nhẹ
                  className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            <motion.div
              layout
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* ===== PHẦN ĐĂNG KÝ NHẬN TIN (NEWSLETTER) ===== */}
        <section className="bg-green-800 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="sua2 text-4xl font-bold">
              Đừng bỏ lỡ tin tức mới nhất!
            </h2>
            <p className="sua2 mt-4 max-w-2xl mx-auto">
              Đăng ký để nhận các công thức nấu ăn, câu chuyện nông sản và ưu
              đãi đặc biệt từ Shinsen.
            </p>
            <form className="sua3 mt-8 flex flex-col md:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="sua2 w-full px-5 py-3 rounded-full text-gray-800 focus:outline-none ring-2 ring-green-300 focus:ring-4 focus:ring-green-300 transition-shadow"
              />
              <motion.button
                type="submit"
                className="sua3 sua2 sua1 w-full md:w-auto bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow-lg"
                whileHover={{ scale: 1.05, backgroundColor: "#f0fdf4" }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng ký
              </motion.button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
