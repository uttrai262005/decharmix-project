const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
} = require("../controllers/customerController");
// (Dùng tên 'adminMiddleware' của bạn từ file [115])
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

// Bảo vệ tất cả route này bằng admin
router.use(protect, adminMiddleware);

router.route("/").get(getAllCustomers);

router.route("/:id").get(getCustomerById).put(updateCustomer);

module.exports = router;
