"use client";

import { motion, Variants } from "framer-motion";
import {
  FiUsers,
  FiStar,
  FiPenTool,
  FiAward,
  FiHeart,
  FiSmile,
} from "react-icons/fi";
import Image from "next/image";
import styles from "./about.module.css";

// --- COMPONENT TIÊU ĐỀ SECTION ---
const SectionTitle = ({ children }: { children: string }) => {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const letters = Array.from(children);

  return (
    <div className={styles.titleWrapper}>
      <motion.svg
        className={styles.titleDecoration}
        viewBox="0 0 200 200"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        <path
          d="M 100, 20 C 144.18, 20 180, 55.82 180, 100 C 180, 144.18 144.18, 180 100, 180 C 55.82, 180 20, 144.18 20, 100 C 20, 55.82 55.82, 20 100, 20"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>
      <motion.h2
        className={styles.sectionTitleText}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        aria-label={children}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={childVariants}
            className="inline-block"
            style={{ whiteSpace: "pre" }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h2>
    </div>
  );
};

// --- ELEMENT: DẢI PHÂN CÁCH ---
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
        stroke="#fbcfe8"
        strokeWidth="1.5"
        fill="none"
      />
    </motion.svg>
  </div>
);

// --- COMPONENT: CỘT MỐC (MILESTONE) ---
const Milestone = ({ icon, year, title, children, delay = 0 }: any) => (
  <motion.div
    className={styles.milestoneItem}
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className={styles.milestoneIconBox}>{icon}</div>
    <div>
      <h3 className={styles.milestoneYear}>{year}</h3>
      <p className={styles.milestoneTitle}>{title}</p>
      <p className={styles.milestoneDesc}>{children}</p>
    </div>
  </motion.div>
);

// --- COMPONENT: GIÁ TRỊ CỐT LÕI ---
const CoreValue = ({ icon, title, children }: any) => (
  <motion.div
    className={styles.valueCard}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <div className={styles.valueIconBox}>{icon}</div>
    <h3 className={styles.valueTitle}>{title}</h3>
    <p className={styles.valueDescription}>{children}</p>
  </motion.div>
);

export default function AboutPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* ===== PHẦN HERO ===== */}
      <section
        className={styles.heroSection}
        style={{ backgroundImage: "url('/Decharmix.png)" }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Về Decharmix
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Không gian sáng tạo — Nơi bạn tự tay kết nối từng hạt charm, từng
            sợi dây để kể câu chuyện của riêng mình.
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN CÂU CHUYỆN THƯƠNG HIỆU ===== */}
      <section className={`${styles.container} ${styles.storySection}`}>
        <div>
          <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            <SectionTitle>Câu chuyện Decharmix</SectionTitle>
          </div>
          <motion.p
            className={styles.storyText}
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Decharmix là thương hiệu phụ kiện handmade mang tinh thần “Tự tay cá
            nhân hóa”, được sáng lập bởi những người trẻ yêu thích sáng tạo và
            thủ công.
          </motion.p>
          <motion.p
            className={styles.storyText}
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Thương hiệu hướng tới việc giúp khách hàng thể hiện bản thân qua
            từng chi tiết nhỏ — từ hạt charm, dây đeo, đến phụ kiện trang trí —
            tất cả đều mang đậm dấu ấn cá nhân và cảm xúc riêng.
          </motion.p>
        </div>
        <motion.div
          className={styles.storyImageWrapper}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          {/* --- ĐÃ SỬA: Đổi src thành /Decharmix.png --- */}
          <Image
            src="/Decharmix.png"
            alt="Câu chuyện Decharmix"
            width={500}
            height={350}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN GIÁ TRỊ CỐT LÕI ===== */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <SectionTitle>Giá trị cốt lõi</SectionTitle>
          </div>
          <div className={styles.valuesGrid}>
            <CoreValue icon={<FiSmile size={32} />} title="Tinh Thần Người Trẻ">
              Sự nhiệt huyết và không ngại thử nghiệm. Chúng tôi luôn cập nhật
              những xu hướng charm và phụ kiện mới nhất để bạn thỏa sức "bắt
              trend".
            </CoreValue>
            <CoreValue icon={<FiPenTool size={32} />} title="Tự Do Sáng Tạo">
              Không có công thức cố định. Tại Decharmix, bạn chính là nhà thiết
              kế, tự do phối màu và chọn charm theo gu thẩm mỹ của riêng mình.
            </CoreValue>
            <CoreValue icon={<FiHeart size={32} />} title="Cảm Xúc & Ý Nghĩa">
              Mỗi sản phẩm hoàn thiện không chỉ đẹp mà còn chứa đựng kỷ niệm,
              thông điệp cá nhân mà bạn muốn gửi gắm cho bản thân hoặc người
              thương.
            </CoreValue>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN HÀNH TRÌNH ===== */}
      <section className={styles.container}>
        <div style={{ textAlign: "center" }}>
          <SectionTitle>Hành trình Decharmix</SectionTitle>
        </div>
        <div className={styles.timelineContainer}>
          <div className={styles.timelineLineBase}></div>
          <motion.div
            className={styles.timelineLineActive}
            style={{ originY: 0 }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.5 }}
          />
          <div className={styles.milestoneList}>
            <Milestone
              icon={<FiStar size={28} />}
              year="2020"
              title="Khơi nguồn ý tưởng"
              delay={0.2}
            >
              Từ niềm đam mê với những hạt charm nhỏ xíu, nhóm bạn trẻ sáng lập
              bắt đầu thử nghiệm những mẫu vòng tay đầu tiên với mong muốn tạo
              ra sự khác biệt so với thị trường đại trà.
            </Milestone>
            <Milestone
              icon={<FiPenTool size={28} />}
              year="2022"
              title="Cá nhân hóa trải nghiệm"
              delay={0.6}
            >
              Ra mắt bộ sưu tập "DIY Kit" cho phép khách hàng tự phối charm tại
              nhà. Decharmix bắt đầu được biết đến như một cộng đồng nhỏ dành
              cho những ai yêu thích thủ công.
            </Milestone>
            <Milestone
              icon={<FiUsers size={28} />}
              year="2024"
              title="Lan tỏa dấu ấn riêng"
              delay={1.0}
            >
              Trở thành thương hiệu phụ kiện được yêu thích với hàng nghìn mẫu
              charm độc đáo. Chúng tôi tiếp tục hành trình giúp mỗi người trẻ tự
              tin khẳng định "chất tôi" qua từng món đồ nhỏ xinh.
            </Milestone>
          </div>
        </div>
      </section>

      {/* ===== PHẦN CTA ===== */}
      <section className={styles.ctaSection}>
        <div className={`${styles.container} text-center`}>
          <h2 className={styles.ctaHeading}>Sẵn sàng kể câu chuyện của bạn?</h2>
          <p className={styles.ctaText}>
            Ghé thăm bộ sưu tập charm và dây đeo đa dạng của chúng tôi để bắt
            đầu hành trình "tự tay cá nhân hóa" ngay hôm nay.
          </p>
          <motion.a
            href="/products"
            className={styles.ctaButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tự thiết kế ngay
          </motion.a>
        </div>
      </section>
    </div>
  );
}
