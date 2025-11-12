const express = require("express");
const router = express.Router();
const passport = require("passport"); // <-- 1. IMPORT PASSPORT
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  googleLoginCallback,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// === 3. THÊM 2 ROUTE GOOGLE (Đầu tiên) ===
// (Khi user bấm nút "Đăng nhập Google" ở frontend)
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// (Sau khi Google xác thực, họ sẽ redirect về link này)
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`,
    session: false, // Không dùng session
  }),
  googleLoginCallback // Nếu thành công
);
// ======================================

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
