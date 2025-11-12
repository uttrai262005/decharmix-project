const pool = require("../config/db");

// @desc    Lấy tất cả nhà cung cấp
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = async (req, res) => {
  try {
    const allSuppliers = await pool.query(
      "SELECT * FROM suppliers ORDER BY name ASC"
    );
    res.json(allSuppliers.rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhà cung cấp:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// @desc    Tạo nhà cung cấp mới
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res) => {
  const { name, contact_person, phone, address } = req.body;
  if (!name || !contact_person || !phone) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp đủ thông tin nhà cung cấp." });
  }
  try {
    const newSupplier = await pool.query(
      "INSERT INTO suppliers (name, contact_person, phone, address) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, contact_person, phone, address]
    );
    res.status(201).json(newSupplier.rows[0]);
  } catch (error) {
    console.error("Lỗi khi tạo nhà cung cấp:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
};
