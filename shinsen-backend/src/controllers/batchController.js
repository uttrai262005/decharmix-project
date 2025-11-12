const pool = require("../config/db");

// @desc    Lấy tất cả lô hàng
// @route   GET /api/batches
// @access  Public
const getBatches = async (req, res) => {
  try {
    const allBatches = await pool.query(
      "SELECT * FROM batches ORDER BY received_date DESC"
    );
    res.json(allBatches.rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lô hàng:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// @desc    Tạo lô hàng mới
// @route   POST /api/batches
// @access  Private/Admin
const createBatch = async (req, res) => {
  const { product_id, supplier_id, quantity, received_date, expiry_date } =
    req.body;
  if (!product_id || !supplier_id || !quantity || !received_date) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp đủ thông tin lô hàng." });
  }
  try {
    const newBatch = await pool.query(
      "INSERT INTO batches (product_id, supplier_id, quantity, received_date, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [product_id, supplier_id, quantity, received_date, expiry_date]
    );
    res.status(201).json(newBatch.rows[0]);
  } catch (error) {
    console.error("Lỗi khi tạo lô hàng:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

module.exports = {
  getBatches,
  createBatch,
};
