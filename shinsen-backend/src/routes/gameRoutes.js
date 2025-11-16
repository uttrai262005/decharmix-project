const express = require("express");
const router = express.Router();
const {
  // USER
  getGameStats,
  spinWheel,
  openGiftBox,
  playMemoryGame,
  playWhacGame,
  playJumpGame,
  playSliceGame,

  // ADMIN
  getWheelPrizes,
  getLuckyWheelSettings,
  updateLuckyWheelSettings,
  getSkillGameRewards,
  updateSkillGameRewards,
  getGiftBoxPrizes,
  createGiftBoxPrize,
  updateGiftBoxPrize,
  deleteGiftBoxPrize,
} = require("../controllers/gameController");

// === SỬA LỖI: IMPORT TỪ 'authMiddleware' ===
// (File 'adminMiddleware.js' ở [114] là tôi hướng dẫn sai, file này mới đúng)
const { protect, adminMiddleware } = require("../middleware/authMiddleware");
router.get("/wheel-prizes", getWheelPrizes);

// ==============================
// === ROUTES CHO NGƯỜI CHƠI ===
// ==============================
router.use(protect);
router.get("/stats", getGameStats);
router.post("/spin", spinWheel);
router.post("/open-box", openGiftBox);
router.post("/memory-play", playMemoryGame);
router.post("/whac-play", playWhacGame);
router.post("/jump-play", playJumpGame);
router.post("/slice-play", playSliceGame);
// ==============================
// === ROUTES CHO ADMIN ===
// ==============================
const adminRouter = express.Router();
// === SỬA LỖI: Dùng 'adminMiddleware' ===
adminRouter.use(protect, adminMiddleware);

// Vòng quay
adminRouter
  .route("/lucky-wheel")
  .get(getLuckyWheelSettings)
  .put(updateLuckyWheelSettings);

// 4 Game Kỹ năng
adminRouter
  .route("/skill-rewards")
  .get(getSkillGameRewards)
  .put(updateSkillGameRewards);

// Hộp quà
adminRouter.route("/gift-box").get(getGiftBoxPrizes).post(createGiftBoxPrize);
adminRouter
  .route("/gift-box/:id")
  .put(updateGiftBoxPrize)
  .delete(deleteGiftBoxPrize);

// Gắn router con vào route chính
router.use("/admin", adminRouter);

module.exports = router;
