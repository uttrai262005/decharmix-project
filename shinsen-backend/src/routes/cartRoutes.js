const express = require("express");
const router = express.Router();
// BƯỚC 1: Import thêm 2 hàm updateCartItem và removeCartItem
const {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// Middleware 'protect' sẽ được áp dụng cho tất cả các route bên dưới
router.use(protect);

// Route cho /api/cart (Lấy giỏ hàng và Thêm sản phẩm)
router.route("/").get(getCart).post(addItemToCart);

// BƯỚC 2: Thêm các route còn thiếu cho việc Cập nhật và Xóa
// URL sẽ có dạng /api/cart/:productId (ví dụ: /api/cart/1)
router.route("/:productId").put(updateCartItem).delete(removeCartItem);

module.exports = router;
