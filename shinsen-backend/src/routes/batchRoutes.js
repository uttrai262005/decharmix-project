const express = require("express");
const router = express.Router();
const { getBatches, createBatch } = require("../controllers/batchController");
const { protect } = require("../middleware/authMiddleware");

// Route để lấy danh sách lô hàng
router.get("/", getBatches);

// Route để tạo lô hàng mới (yêu cầu đăng nhập và có thể cần quyền admin)
router.post("/", protect, createBatch);

module.exports = router;
