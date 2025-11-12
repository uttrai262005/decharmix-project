const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");
// (Dùng tên 'adminMiddleware' của bạn từ file [115])
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

// Bảo vệ tất cả route
router.use(protect, adminMiddleware);

router.route("/").get(getSettings).put(updateSettings);

module.exports = router;
