"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import Image from "next/image";
// Import file CSS styles
import styles from "./contact.module.css";

// --- DỮ LIỆU MẪU (Đã đổi tên sang Decharmix) ---
const faqs = [
  {
    question: "Decharmix có giao hàng toàn quốc không?",
    answer:
      "Hiện tại, Decharmix hỗ trợ giao hàng nhanh trên toàn quốc. Phí vận chuyển và thời gian nhận hàng sẽ tùy thuộc vào địa chỉ của bạn.",
  },
  {
    question: "Làm thế nào để tôi kiểm tra chất lượng sản phẩm?",
    answer:
      "Chúng tôi khuyến khích bạn kiểm tra hàng trước khi thanh toán (với đơn ship COD). Sản phẩm cam kết giống hình 98%.",
  },
  {
    question: "Chính sách đổi trả của Decharmix như thế nào?",
    answer:
      "Cam kết đổi mới trong vòng 3 ngày nếu sản phẩm có lỗi từ nhà sản xuất hoặc bị hư hỏng trong quá trình vận chuyển.",
  },
  {
    question: "Làm sao để áp dụng mã giảm giá?",
    answer:
      'Tại bước thanh toán, nhập mã vào ô "Voucher" và nhấn Áp dụng. Hệ thống sẽ tự động trừ tiền cho bạn.',
  },
];

// --- Component Card (Giữ nguyên cấu trúc) ---
const ContactInfoCard = ({ icon, title, children }: any) => (
  <motion.div
    className={styles.infoCard}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <div className={styles.iconBox}>{icon}</div>
    <div className={styles.cardContent}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <div className={styles.cardText}>{children}</div>
    </div>
  </motion.div>
);

// --- Component FAQ ---
const FAQItem = ({ faq, isOpen, onClick }: any) => {
  return (
    <motion.div layout className={styles.faqItem} initial={{ borderRadius: 8 }}>
      <motion.button layout onClick={onClick} className={styles.faqButton}>
        <span style={{ transition: "color 0.2s" }}>{faq.question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={styles.faqArrow}
        >
          <FiChevronDown size={24} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Component Dải phân cách ---
const SectionDivider = () => (
  <div className={styles.divider}>
    <motion.svg
      width="80"
      height="10"
      viewBox="0 0 80 10"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 2 }}
    >
      <path
        d="M 5,5 C 20,10 30,0 40,5 C 50,10 60,0 75,5"
        stroke="#fbcfe8" /* Màu hồng nhạt */
        strokeWidth="1.5"
        fill="none"
      />
    </motion.svg>
  </div>
);

// --- MAIN PAGE ---
export default function ContactPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        {/* ===== HERO ===== */}
        <section className={styles.heroSection}>
          <motion.div
            className={styles.heroImage}
            style={{ y: "-50%" }}
            animate={{ y: "0%" }}
            transition={{ ease: "easeOut", duration: 1.2 }}
          >
            <Image
              src="/Contact-Decharmix.png"
              alt="Decharmix Contact"
              layout="fill"
              objectFit="cover"
            />
          </motion.div>
          <div className={styles.heroContent}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Liên hệ với Decharmix
            </motion.h1>
            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Chúng tôi luôn sẵn lòng lắng nghe và giải đáp mọi thắc mắc của
              bạn.
            </motion.p>
          </div>
        </section>

        <SectionDivider />

        {/* ===== INFO CARDS ===== */}
        <section className={styles.container}>
          <div className={styles.infoGrid}>
            <ContactInfoCard icon={<FiMapPin size={28} />} title="Địa chỉ">
              <p>Quận Đống Đa</p>
              <p>Hà Nội, Việt Nam</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiPhone size={28} />} title="Điện thoại">
              <p>Hotline: 1900 1234</p>
              <p>CSKH: 0987 654 321</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiMail size={28} />} title="Hộp thư">
              <p>cskh@decharmix.com</p>
              <p>contact@decharmix.com</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiClock size={28} />} title="Giờ làm việc">
              <p>Thứ 2 - Thứ 7: 8:00 - 20:00</p>
              <p>Chủ nhật: 8:00 - 17:00</p>
            </ContactInfoCard>
          </div>
        </section>

        <SectionDivider />

        {/* ===== MAP & FORM ===== */}
        <section className={styles.mapFormSection}>
          <div className={`${styles.container} ${styles.mapFormGrid}`}>
            {/* Map (Bên trái/Trên) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={styles.sectionHeadingPink}>
                Tìm chúng tôi trên bản đồ
              </h2>
              <div className={styles.mapWrapper}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.484221183353!2d106.76933817584167!3d10.85072018930283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x17d74e19ed8e2720!2sKhu%20C%C3%B4ng%20ngh%E1%BB%87%20cao%20TP.HCM!5e0!3m2!1svi!2s!4v1726990000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>

            {/* Form (Bên phải/Dưới) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={styles.sectionHeadingPink}>
                Gửi lời nhắn cho chúng tôi
              </h2>
              <form className={styles.formWrapper}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>
                    Họ và tên
                  </label>
                  <input type="text" id="name" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email
                  </label>
                  <input type="email" id="email" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    Lời nhắn
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className={styles.formTextarea}
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className={styles.submitButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Gửi đi
                </motion.button>
              </form>
            </motion.div>
          </div>
        </section>

        <SectionDivider />

        {/* ===== FAQ ===== */}
        <section className={styles.faqSection}>
          <div className={styles.faqContainer}>
            <div className={styles.faqHeader}>
              <h2 className={styles.sectionHeadingPink}>Câu hỏi thường gặp</h2>
              <p className="text-lg text-gray-600 mt-4">
                Tìm câu trả lời nhanh cho các câu hỏi phổ biến nhất.
              </p>
            </div>

            <div>
              <div className={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <div className={styles.searchIcon}>
                  <FiSearch size={20} />
                </div>
              </div>

              <div className={styles.faqList}>
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      faq={faq}
                      isOpen={openFAQ === index}
                      onClick={() =>
                        setOpenFAQ(openFAQ === index ? null : index)
                      }
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Không tìm thấy câu hỏi phù hợp.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
