const express = require("express");
const router = express.Router();
const traceController = require("../controllers/traceController");

// GET /api/trace/:batchCode - Lấy thông tin truy vết theo mã lô hàng
router.get("/:batchCode", traceController.getTraceabilityInfo);

module.exports = router;
