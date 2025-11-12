const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  searchProducts, // (Hàm này của bạn)
  getDealOfTheDay, // (Hàm này của bạn)
  getGiftBoxAssets, // (Hàm này của bạn)
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// === 1. IMPORT MIDDLEWARE (Đang bị thiếu) ===
// (Giả sử bạn dùng tên 'admin' từ 'adminMiddleware.js' như tôi hướng dẫn)
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
// (Nếu bạn gộp chung, hãy dùng: const { protect, admin } = require("../middleware/authMiddleware");)
// ===========================================

// --- ROUTE GỐC (Lấy tất cả) ---
router.get("/", getProducts);

// --- CÁC ROUTE TĨNH (Phải nằm trên 'GET /:id') ---
router.get("/search", searchProducts);
router.get("/deal-of-the-day", getDealOfTheDay);
router.get("/gift-box-assets", getGiftBoxAssets);

// --- ROUTE ADMIN (Bảo vệ) ---
// (Các route này dùng POST, PUT, DELETE nên không xung đột với GET)
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// --- ROUTE ĐỘNG (Phải nằm CUỐI CÙNG) ---
router.get("/:id", getProductById);
// ===========================

module.exports = router;
