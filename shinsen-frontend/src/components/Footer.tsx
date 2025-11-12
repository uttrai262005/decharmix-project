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
import styles from "./Footer.module.css";

// --- Họa tiết sóng (Đã đổi màu fill) ---
const SeigaihaPattern = () => (
  <div
    className={styles.seigaihaPattern}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffe2f2' fill-opacity='0.5'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    }}
  ></div>
);

// --- Component Icon Momo (vì react-icons không có) ---
const IconMomo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.momoIcon}
  >
    <circle cx="20" cy="20" r="20" fill="#AE2070" />
    <path
      d="M20.0001 11.2C17.2001 11.2 14.9001 13.5 14.9001 16.3C14.9001 19.1 17.2001 21.4 20.0001 21.4C22.8001 21.4 25.1001 19.1 25.1001 16.3C25.1001 13.5 22.8001 11.2 20.0001 11.2ZM20.0001 22.4C16.5001 22.4 13.6001 25.1 13.6001 28.3C13.6001 29 13.7001 29.6 13.9001 30.2C15.3001 28 17.5001 26.5 20.0001 26.5C22.5001 26.5 24.7001 28 26.1001 30.2C26.3001 29.6 26.4001 29 26.4001 28.3C26.4001 25.1 23.5001 22.4 20.0001 22.4Z"
      fill="white"
    />
  </svg>
);

export default function Footer() {
  return (
    <motion.footer
      className={styles.footerWrapper} // <-- 2. Thay class
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
    >
      <SeigaihaPattern />
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Cột 1: Logo & Giới thiệu */}
          <div className={styles.column}>
            <Link href="/" className={styles.logo}>
              Decharmix {/* <-- 3. ĐỔI TÊN */}
            </Link>
            <p className={styles.description}>
              Phụ kiện handmade độc đáo,
              <br />
              thể hiện cá tính của bạn.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <FiFacebook size={24} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FiInstagram size={24} />
              </a>
              <a href="#" className={styles.socialLink}>
                <FiYoutube size={24} />
              </a>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div className={styles.column}>
            <h3 className={styles.footerTitle}>Về chúng tôi</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  Câu chuyện Decharmix {/* <-- 4. ĐỔI TÊN */}
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.footerLink}>
                  Tin tức & Blog
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>
                  Cơ hội nghề nghiệp
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div className={styles.column}>
            <h3 className={styles.footerTitle}>Hỗ trợ</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.footerLink}>
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="#" className={styles.footerLink}>
                  Chính sách đổi trả
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div className={styles.column}>
            <h3 className={styles.footerTitle}>Đăng ký nhận tin</h3>
            <p className={styles.description}>
              Nhận thông tin về sản phẩm mới và các chương trình ưu đãi đặc
              biệt.
            </p>
            <div className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Email của bạn"
                className={styles.newsletterInput}
              />
              <button className={styles.newsletterButton}>Gửi</button>
            </div>
          </div>
        </div>

        {/* --- Dải dưới cùng --- */}
        <div className={styles.bottomBar}>
          <p>
            &copy; {new Date().getFullYear()} Decharmix. Đã đăng ký bản quyền.{" "}
            {/* <-- 5. ĐỔI TÊN */}
          </p>
          <div className={styles.paymentIcons}>
            <span>Chấp nhận thanh toán:</span>
            <FaCcVisa size={28} />
            <FaCcMastercard size={28} />
            <FaCcJcb size={28} />
            <IconMomo /> {/* <-- 6. THÊM MOMO */}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
