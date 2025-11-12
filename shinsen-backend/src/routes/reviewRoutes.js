const express = require("express");
const router = express.Router();
// Sửa lại dòng import để lấy cả 2 hàm
const {
  addReview,
  getReviewsForProduct,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Route để lấy tất cả review của một sản phẩm (dựa trên productId)
router.get("/:productId", getReviewsForProduct);

// Route để thêm một review mới
router.post("/", protect, addReview);

module.exports = router;
