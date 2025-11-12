const pool = require("../config/db");

// @desc    A. Lấy các voucher "công khai" còn lượt và còn hạn (CHO USER)
// @route   GET /api/vouchers/available
const getAvailableVouchers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM vouchers 
      WHERE is_active = TRUE 
      AND end_date > NOW() 
      AND quantity_used < quantity
      ORDER BY end_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy voucher công khai:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    B. "Giựt" (Lưu) voucher vào ví user (CHO USER)
// @route   POST /api/vouchers/snatch/:id
const snatchVoucher = async (req, res) => {
  const userId = req.user.id;
  const { id: voucherId } = req.params;

  try {
    const voucherRes = await pool.query(
      "SELECT * FROM vouchers WHERE id = $1 AND is_active = TRUE AND end_date > NOW() AND quantity_used < quantity",
      [voucherId]
    );

    if (voucherRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Voucher không tồn tại hoặc đã hết lượt." });
    }

    await pool.query(
      "INSERT INTO user_vouchers (user_id, voucher_id) VALUES ($1, $2) ON CONFLICT (user_id, voucher_id) DO NOTHING",
      [userId, voucherId]
    );

    res.status(200).json({ message: "Đã lưu voucher!" });
  } catch (error) {
    if (error.code === "23505") {
      // 'unique violation'
      return res.status(409).json({ error: "Bạn đã có voucher này rồi." });
    }
    console.error("Lỗi khi săn voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    C. Lấy các voucher trong ví của user (CHO USER)
// @route   GET /api/vouchers/my
const getMyVouchers = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows } = await pool.query(
      `
      SELECT v.* FROM vouchers v
      JOIN user_vouchers uv ON v.id = uv.voucher_id
      WHERE uv.user_id = $1 
      AND uv.is_used = FALSE 
      AND v.end_date > NOW()
      AND v.is_active = TRUE
      ORDER BY v.end_date ASC
    `,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy voucher của tôi:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// ===================================
// === API CHO ADMIN (CODE MỚI) ===
// ===================================

// @desc    Lấy tất cả vouchers (Admin)
// @route   GET /api/vouchers (Admin)
const getAllVouchers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vouchers ORDER BY end_date DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy vouchers:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Lấy 1 voucher bằng ID (Admin)
// @route   GET /api/vouchers/:id (Admin)
const getVoucherById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM vouchers WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Tạo voucher mới (Admin)
// @route   POST /api/vouchers (Admin)
const createVoucher = async (req, res) => {
  const {
    code,
    description,
    type,
    value,
    min_order_value,
    max_discount,
    start_date,
    end_date,
    quantity,
    is_active,
  } = req.body;

  if (!code || !type || !value || !end_date || !quantity) {
    return res.status(400).json({ error: "Vui lòng điền các trường bắt buộc" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vouchers 
       (code, description, type, value, min_order_value, max_discount, start_date, end_date, quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        code.toUpperCase(),
        description,
        type,
        value,
        min_order_value || 0,
        max_discount || null,
        start_date || new Date(),
        end_date,
        quantity,
        is_active || true,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mã code này đã tồn tại" });
    }
    console.error("Lỗi khi tạo voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật voucher (Admin)
// @route   PUT /api/vouchers/:id (Admin)
const updateVoucher = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    description,
    type,
    value,
    min_order_value,
    max_discount,
    start_date,
    end_date,
    quantity,
    is_active,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE vouchers 
       SET 
         code = $1, description = $2, type = $3, value = $4, 
         min_order_value = $5, max_discount = $6, start_date = $7, 
         end_date = $8, quantity = $9, is_active = $10
       WHERE id = $11
       RETURNING *`,
      [
        code.toUpperCase(),
        description,
        type,
        value,
        min_order_value,
        max_discount,
        start_date,
        end_date,
        quantity,
        is_active,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mã code này đã tồn tại" });
    }
    console.error("Lỗi khi cập nhật voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Xóa voucher (Admin)
// @route   DELETE /api/vouchers/:id (Admin)
const deleteVoucher = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM vouchers WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy voucher" });
    }
    res.json({ message: "Xóa voucher thành công" });
  } catch (error) {
    if (error.code === "23503") {
      // Lỗi khóa ngoại
      return res
        .status(400)
        .json({
          error: "Xóa thất bại! Voucher này đã được gán cho người dùng.",
        });
    }
    console.error("Lỗi khi xóa voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// GỘP 2 BỘ EXPORTS
module.exports = {
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
};
