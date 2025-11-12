const express = require("express");
const router = express.Router();
const {
  // User
  getAvailableVouchers,
  snatchVoucher,
  getMyVouchers,
  // Admin
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} = require("../controllers/voucherController");

// Sửa tên 'admin' thành 'adminMiddleware' cho khớp với file [115] của bạn
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

// ==============================
// === ROUTES CHO NGƯỜI DÙNG ===
// ==============================
// A. Lấy voucher công khai (Ai cũng xem được)
router.get("/available", getAvailableVouchers);

// B. "Giựt" voucher (Phải đăng nhập)
router.post("/snatch/:id", protect, snatchVoucher);

// C. Lấy voucher của tôi (Phải đăng nhập)
router.get("/my", protect, getMyVouchers);

// ==============================
// === ROUTES CHO ADMIN ===
// ==============================
// (Bảo vệ tất cả các route này bằng 'protect' và 'adminMiddleware')
const adminRouter = express.Router();
adminRouter.use(protect, adminMiddleware);

adminRouter.route("/").get(getAllVouchers).post(createVoucher);

adminRouter
  .route("/:id")
  .get(getVoucherById)
  .put(updateVoucher)
  .delete(deleteVoucher);

// Gắn router con của admin vào / (thay vì /admin)
// Cẩn thận: Đặt route admin LÊN TRÊN route user có :id
// Sửa lại cấu trúc:
router.use("/", adminRouter); // Đặt / (admin) lên trên /:id (user)

module.exports = router;
