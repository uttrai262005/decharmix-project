const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getDashboardTodo,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Áp dụng 'protect' (phải đăng nhập) VÀ 'admin' (phải là admin)
router.get("/stats", protect, admin, getDashboardStats);
router.get("/todo", protect, admin, getDashboardTodo);

module.exports = router;
