const express = require("express");
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");

// Route để lấy danh sách nhà cung cấp
router.get("/", getSuppliers);

// Route để tạo nhà cung cấp mới (yêu cầu đăng nhập và có thể cần quyền admin)
router.post("/", protect, createSupplier);

module.exports = router;
