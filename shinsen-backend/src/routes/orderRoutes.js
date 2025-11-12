const express = require("express");
const router = express.Router();
// (Sử dụng tên middleware của bạn: 'adminMiddleware')
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

const {
  createOrder,
  handleMomoWebhook,
  handleVnpayWebhook,
  handleZaloPayCallback,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  applyVoucher,
  getGiftDetailsByToken,
  claimGift,
} = require("../controllers/orderController");

// === Route CÔNG KHAI (Nhận quà & Webhooks) ===
router.get("/gift-details/:token", getGiftDetailsByToken);
router.post("/claim-gift", claimGift);
router.post("/momo-ipn", handleMomoWebhook);
router.get("/vnpay_ipn", handleVnpayWebhook);
router.post("/zalopay_callback", handleZaloPayCallback);

// === Route USER (Bảo vệ bởi 'protect') ===
router.post("/", protect, createOrder);
router.post("/apply-voucher", protect, applyVoucher);

// Sửa route: Thêm '/my-orders' để user xem đơn CỦA MÌNH
router.get("/my-orders", protect, getUserOrders);
// Sửa route: Thêm '/my-orders' để user xem chi tiết
router.get("/my-orders/:id", protect, getOrderById);

// === Route ADMIN (Bảo vệ bởi 'protect' và 'adminMiddleware') ===
// Sửa route: Admin lấy TẤT CẢ đơn hàng (dùng route gốc '/')
router.get("/", protect, adminMiddleware, getAllOrders);
// Sửa route: Admin cập nhật trạng thái
router.put("/:id/status", protect, adminMiddleware, updateOrderStatus);
// Sửa route: Admin xem BẤT KỲ đơn hàng nào
router.get("/:id", protect, adminMiddleware, getOrderById);

module.exports = router;
