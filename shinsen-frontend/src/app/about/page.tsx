"use client";

import { motion, Variants } from "framer-motion";
import { FiUsers, FiSunrise, FiTruck, FiAward, FiHeart } from "react-icons/fi";
import Image from "next/image";

// --- COMPONENT TIÊU ĐỀ SECTION (Không đổi) ---
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
    <div className="relative inline-block mb-12">
      <motion.svg
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] text-green-100 -z-10"
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
        className="text-4xl font-bold text-green-800 text-center" // <-- Tiêu đề này đã có màu xanh lá cây
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

// --- ELEMENT: DẢI PHÂN CÁCH (Không đổi) ---
const SectionDivider = () => (
  <div className="py-16 text-center">
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
        stroke="#9ca3af"
        strokeWidth="1.5"
        fill="none"
      />
    </motion.svg>
  </div>
);

// --- COMPONENT: THÀNH TỰU (CẬP NHẬT) ---
const Milestone = ({ icon, year, title, children, delay = 0 }: any) => (
  <motion.div
    className="flex items-start space-x-4"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.6, delay }}
  >
    <div className="flex-shrink-0 w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <div>
      {/* CẬP NHẬT: Mục năm đã có màu xanh */}
      <h3 className="text-xl font-bold text-green-800">{year}</h3>
      {/* CẬP NHẬT: Chuyển tiêu đề phụ sang màu xanh lá cây đồng nhất */}
      <p className="text-lg font-semibold text-green-800 mt-1 transition-colors duration-300">
        {title}
      </p>
      <p className="mt-2 text-gray-600">{children}</p>
    </div>
  </motion.div>
);

// --- COMPONENT: GIÁ TRỊ CỐT LÕI (CẬP NHẬT) ---
const CoreValue = ({ icon, title, children }: any) => (
  <motion.div
    className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <div className="inline-flex p-4 bg-green-100 text-green-700 rounded-full mb-4 group-hover:bg-green-200 transition-colors duration-300">
      {icon}
    </div>
    {/* CẬP NHẬT: Chuyển tiêu đề phụ sang màu xanh lá cây đồng nhất */}
    <h3 className="text-2xl font-bold text-green-800 mb-2 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-gray-600">{children}</p>
  </motion.div>
);

export default function AboutPage() {
  return (
    <div className="bg-gray-50 pt-20">
      {/* ===== PHẦN HERO ===== */}
      <section
        className="relative bg-cover bg-center text-white flex items-center justify-center h-[450px]"
        style={{ backgroundImage: "url('/farm-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Mục này giữ màu trắng để dễ đọc trên nền tối */}
          <motion.h1
            className=" text-5xl md:text-7xl font-bold tracking-tight color-green-500 text-white"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Về Shinsen
          </motion.h1>
          <motion.p
            className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Mang sự tươi ngon từ trang trại & đại dương đến tận bàn ăn của bạn.
          </motion.p>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN CÂU CHUYỆN THƯƠNG HIỆU ===== */}
      <section className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="xanh text-left mb-6">
            {/* Mục này đã có màu xanh */}
            <SectionTitle>Câu chuyện của chúng tôi</SectionTitle>
          </div>
          <motion.p
            className="text-lg text-gray-600 mb-4"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Shinsen (新鮮) trong tiếng Nhật có nghĩa là "tươi mới". Đó không chỉ
            là một cái tên, mà là lời hứa và là triết lý cốt lõi mà chúng tôi
            theo đuổi mỗi ngày. Hành trình của Shinsen bắt đầu từ nỗi trăn trở
            về những bữa ăn an toàn, chất lượng cho gia đình.
          </motion.p>
          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Chúng tôi tin rằng, mỗi bữa ăn ngon đều bắt nguồn từ những nguyên
            liệu thuần khiết nhất. Vì vậy, chúng tôi đã không ngừng tìm kiếm,
            kết nối với các trang trại và ngư trường tâm huyết để xây dựng một
            quy trình khép kín "From Farm & Sea to Table", cắt giảm tối đa các
            khâu trung gian, đảm bảo sản phẩm đến tay bạn luôn ở trạng thái tươi
            ngon và trọn vẹn dinh dưỡng nhất.
          </motion.p>
        </div>
        <motion.div
          className="rounded-lg overflow-hidden shadow-2xl max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/our-story.jpg"
            alt="Câu chuyện của Shinsen"
            width={500}
            height={350}
            className="object-cover w-full h-full"
          />
        </motion.div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN GIÁ TRỊ CỐT LÕI ===== */}
      <section className="bg-green-50 py-20">
        <div className="xanh container mx-auto px-6 text-center">
          {/* Mục này đã có màu xanh */}
          <SectionTitle>Giá trị cốt lõi</SectionTitle>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Các mục con bên trong đã được chuyển sang màu xanh */}
            <CoreValue icon={<FiSunrise size={32} />} title="Tươi & Sạch">
              Cam kết 100% sản phẩm được tuyển chọn kỹ lưỡng, tuân thủ các tiêu
              chuẩn an toàn và chất lượng nghiêm ngặt.
            </CoreValue>
            <CoreValue icon={<FiTruck size={32} />} title="Minh bạch nguồn gốc">
              Mỗi sản phẩm đều có thể truy xuất nguồn gốc rõ ràng, giúp bạn an
              tâm về hành trình của thực phẩm từ nơi sản xuất.
            </CoreValue>
            <CoreValue
              icon={<FiHeart size={32} />}
              title="Bền vững & Trách nhiệm"
            >
              Chúng tôi hỗ trợ các phương pháp canh tác và đánh bắt bền vững,
              góp phần bảo vệ môi trường và cộng đồng địa phương.
            </CoreValue>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ===== PHẦN HÀNH TRÌNH PHÁT TRIỂN ===== */}
      <section className="container mx-auto px-6">
        <div className="xanh text-center">
          {/* Mục này đã có màu xanh */}
          <SectionTitle>Hành trình của Shinsen</SectionTitle>
        </div>
        <div className="relative ml-8 mt-4">
          <div className="absolute left-0 top-0 h-full w-0.5 bg-green-200"></div>
          <motion.div
            className="absolute left-0 top-0 h-full w-0.5 bg-green-600"
            style={{ originY: 0 }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.5 }}
          />
          <div className="xanh space-y-20">
            {/* Các mục con bên trong đã được chuyển sang màu xanh */}
            <Milestone
              icon={<FiAward size={28} />}
              year="2020"
              title="Khởi đầu từ đam mê"
              delay={0.2}
            >
              <div className="xanh space-y-20">Shinsen</div> ra đời với cửa hàng
              trực tuyến đầu tiên, mang đến những sản phẩm nông sản hữu cơ từ
              các trang trại liên kết tại Đà Lạt đến với những khách hàng đầu
              tiên tại TP.HCM.
            </Milestone>
            <Milestone
              icon={<FiUsers size={28} />}
              year="2022"
              title="Vươn ra biển lớn"
              delay={0.6}
            >
              Mở rộng danh mục sản phẩm với hải sản tươi sống được đánh bắt bền
              vững. Ra mắt ứng dụng di động, phục vụ hơn 10,000 khách hàng thân
              thiết và mở rộng giao hàng ra các tỉnh lân cận.
            </Milestone>
            <Milestone
              icon={<FiAward size={28} />}
              year="2024"
              title="Dấu ấn chất lượng"
              delay={1.0}
            >
              Đạt chứng nhận VietGAP cho toàn bộ sản phẩm rau củ. Shinsen tự hào
              trở thành đối tác cung cấp thực phẩm sạch cho nhiều chuỗi nhà hàng
              uy tín và tiếp tục sứ mệnh nâng tầm bữa ăn Việt.
            </Milestone>
          </div>
        </div>
      </section>

      {/* ===== PHẦN KÊU GỌI HÀNH ĐỘNG (Không đổi) ===== */}
      <section className="bg-green-700 text-white py-20 mt-24">
        <div className="xanh container mx-auto px-6 text-center">
          <h2 className="sua3 text-4xl font-bold mb-4">
            Sẵn sàng trải nghiệm sự tươi mới?
          </h2>
          <p className="xanh text-lg mb-8 max-w-2xl mx-auto">
            Khám phá ngay bộ sưu tập nông sản và hải sản tươi ngon nhất, được
            giao tận tay trong ngày.
          </p>
          <motion.a
            href="/products"
            className="sua3 inline-block bg-white text-green-700 font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mua sắm ngay
          </motion.a>
        </div>
      </section>
    </div>
  );
}
