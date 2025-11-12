"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";
import { FaCcVisa, FaCcMastercard, FaCcJcb } from "react-icons/fa";

// --- Icon MoMo ---

// --- Họa tiết sóng Seigaiha ---
const SeigaihaPattern = () => (
  <div
    className="absolute inset-0 z-0 opacity-[0.03]"
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    }}
  ></div>
);

export default function Footer() {
  return (
    <motion.footer
      className="bg-green-900 text-white relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      <SeigaihaPattern />
      {/* SỬA LỖI: Tăng padding-top để tạo khoảng cách */}
      <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
        <div className="sua3 sua1 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Cột 1: Logo & Giới thiệu */}
          <div className="space-y-4">
            <div className="sua3 sua1 flex items-center space-x-2">
              <Link href="/" className="text-3xl font-bold">
                Shinsen
              </Link>
              <div className="w-8 h-8 bg-red-700 border-2 border-red-400 rounded-full flex items-center justify-center font-serif text-white text-lg">
                鮮
              </div>
            </div>
            <p className="text-green-200">
              Mang sự tươi ngon từ trang trại & đại dương đến tận bàn ăn của
              bạn.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-green-200 hover:text-white transition-colors"
              >
                <FiFacebook size={24} />
              </a>
              <a
                href="#"
                className="text-green-200 hover:text-white transition-colors"
              >
                <FiInstagram size={24} />
              </a>
              <a
                href="#"
                className="text-green-200 hover:text-white transition-colors"
              >
                <FiYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Về chúng tôi</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Câu chuyện Shinsen
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Tin tức & Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Cơ hội nghề nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-green-200 hover:text-white hover:underline"
                >
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin (THIẾT KẾ MỚI) */}
          <div className="space-y-4 bg-green-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white">Đăng ký nhận tin</h3>
            <p className="text-green-200">
              Nhận thông tin về sản phẩm mới và các chương trình ưu đãi đặc
              biệt.
            </p>
            <form className="trang flex flex-col space-y-3 pt-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="trang w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition text-green-300"
              />
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-md transition-colors w-full">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* --- Dải dưới cùng --- */}
        <div className="mt-16 pt-8 border-t border-green-800 flex flex-col md:flex-row justify-between items-center text-sm text-green-300">
          <p>
            &copy; {new Date().getFullYear()} Shinsen Market. Đã đăng ký bản
            quyền.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span>Chấp nhận thanh toán:</span>
            <FaCcVisa size={28} />
            <FaCcMastercard size={28} />
            <FaCcJcb size={28} />
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
