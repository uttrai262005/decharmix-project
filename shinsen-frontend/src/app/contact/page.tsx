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

// --- DỮ LIỆU MẪU CHO FAQ ---
const faqs = [
  {
    question: "Shinsen có giao hàng toàn quốc không?",
    answer:
      "Hiện tại, Shinsen hỗ trợ giao hàng nhanh trong ngày tại TP. Hồ Chí Minh và Hà Nội. Đối với các tỉnh thành khác, chúng tôi sẽ sớm triển khai và thông báo đến quý khách.",
  },
  {
    question: "Làm thế nào để tôi kiểm tra nguồn gốc sản phẩm?",
    answer:
      "Mỗi sản phẩm của Shinsen đều đi kèm một mã QR. Bạn có thể sử dụng camera điện thoại để quét mã và xem toàn bộ thông tin về trang trại, ngày thu hoạch, và quy trình bảo quản.",
  },
  {
    question: "Chính sách đổi trả của Shinsen như thế nào?",
    answer:
      "Chúng tôi cam kết 1 đổi 1 hoặc hoàn tiền 100% nếu sản phẩm không đạt chất lượng như cam kết. Vui lòng liên hệ hotline trong vòng 24h kể từ khi nhận hàng để được hỗ trợ.",
  },
  {
    question: "Làm sao để áp dụng mã giảm giá?",
    answer:
      'Tại trang thanh toán, bạn sẽ thấy một ô "Nhập mã giảm giá". Hãy điền mã của bạn vào đó và nhấn "Áp dụng", hệ thống sẽ tự động trừ số tiền tương ứng.',
  },
];

// --- Component Card Thông tin liên hệ ---
const ContactInfoCard = ({ icon, title, children }: any) => (
  <motion.div
    className="bg-white p-8 rounded-lg shadow-lg text-left transform hover:-translate-y-2 transition-transform duration-300 flex items-start space-x-6"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex-shrink-0 inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-700 rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold xanh mb-2">{title}</h3>
      <div className="text-gray-600 space-y-1">{children}</div>
    </div>
  </motion.div>
);

// --- Component Câu hỏi FAQ ---
const FAQItem = ({ faq, isOpen, onClick }: any) => {
  return (
    <motion.div
      layout
      className="bg-gray-50 rounded-lg mb-4 last:mb-0"
      initial={{ borderRadius: 8 }}
    >
      <motion.button
        layout
        onClick={onClick}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 group p-5"
      >
        <span className="group-hover:text-green-600 transition-colors">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-green-600 flex-shrink-0 ml-4"
        >
          <FiChevronDown />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 leading-relaxed px-5 pb-5">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Component Dải phân cách ---
const SectionDivider = () => (
  <div className="py-24 text-center">
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
        stroke="#d1d5db"
        strokeWidth="1.5"
        fill="none"
      />
    </motion.svg>
  </div>
);

// --- Component Trang Liên Hệ ---
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
    <div className="bg-gray-50">
      <main className="pt-20">
        {/* ===== PHẦN HERO ===== */}
        <section className="relative h-[450px] flex items-center justify-center text-center text-white overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: "-50%" }}
            animate={{ y: "0%" }}
            transition={{ ease: "easeOut", duration: 1.2 }}
          >
            <Image
              src="/contact-hero.jpg"
              alt="Vườn tre Shinsen"
              layout="fill"
              objectFit="cover"
              className="brightness-50"
            />
          </motion.div>
          <div className="relative z-10 p-6">
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Liên hệ với Shinsen
            </motion.h1>
            <motion.p
              className="mt-4 text-xl max-w-2xl mx-auto"
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

        {/* ===== PHẦN THÔNG TIN LIÊN HỆ ===== */}
        <section className="xanh container mx-auto px-6">
          <div className="xanh sua2 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ContactInfoCard icon={<FiMapPin size={28} />} title="Địa chỉ">
              <p>Khu công nghệ cao, Quận 9</p>
              <p>TP. Hồ Chí Minh, Việt Nam</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiPhone size={28} />} title="Điện thoại">
              <p>Hotline: 1900 1234</p>
              <p>Hợp tác: 0987 654 321</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiMail size={28} />} title="Hộp thư">
              <p>cskh@shinsen.com</p>
              <p>contact@shinsen.com</p>
            </ContactInfoCard>
            <ContactInfoCard icon={<FiClock size={28} />} title="Giờ làm việc">
              <p>Thứ 2 - Thứ 7: 8:00 - 20:00</p>
              <p>Chủ nhật: 8:00 - 17:00</p>
            </ContactInfoCard>
          </div>
        </section>

        <SectionDivider />

        {/* ===== PHẦN BẢN ĐỒ & FORM LIÊN HỆ (THIẾT KẾ MỚI) ===== */}
        <section className="bg-white py-24">
          {/* SỬA LỖI: Thay đổi cấu trúc grid để bản đồ to hơn */}
          <div className="container mx-auto px-6 grid lg:grid-cols-5 gap-16 items-start">
            {/* Cột bản đồ (chiếm 3/5) */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="sua2 text-4xl font-bold text-green-800 mb-6">
                Tìm chúng tôi trên bản đồ
              </h2>
              {/* SỬA LỖI: Tăng chiều cao và bỏ hiệu ứng grayscale */}
              <div className="h-[550px] rounded-lg overflow-hidden shadow-lg">
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

            {/* Cột form liên hệ (chiếm 2/5) */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="sua2 text-4xl font-bold text-green-800 mb-6">
                Gửi lời nhắn cho chúng tôi
              </h2>
              <form className="space-y-6 bg-gray-50 p-8 rounded-lg">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-lg font-medium text-gray-700"
                  >
                    Lời nhắn
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                  ></textarea>
                </div>
                <motion.button
                  type="submit"
                  className="w-full bg-green-600 text-white font-bold text-lg py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
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

        {/* ===== PHẦN CÂU HỎI THƯỜNG GẶP ===== */}
        <section className="pb-24">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="sua2 text-4xl font-bold text-green-800">
                Câu hỏi thường gặp
              </h2>
              <p className="sua2 text-lg text-gray-600 mt-4">
                Tìm câu trả lời nhanh cho các câu hỏi phổ biến nhất.
              </p>
            </div>

            <div>
              <div className="relative mb-8">
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="sua2 w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <FiSearch size={20} />
                </div>
              </div>

              <div className=" sua3 bg-white p-6 rounded-lg shadow-lg">
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
