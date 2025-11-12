const pool = require("../config/db");

// Hàm tiện ích: Xóa password (copy từ userController)
const sanitizeUser = (user) => {
  if (user) {
    delete user.password;
  }
  return user;
};

// @desc    Lấy tất cả khách hàng (Admin)
// @route   GET /api/customers
const getAllCustomers = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT id, full_name, email, created_at, role 
      FROM users 
      WHERE role = 'user'
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Thêm tìm kiếm
    if (search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Lấy tổng số (để phân trang)
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS total`,
      queryParams
    );
    const totalCustomers = parseInt(totalResult.rows[0].count, 10);

    // Thêm sắp xếp và phân trang
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), offset);

    // Chạy query chính
    const { rows } = await pool.query(query, queryParams);

    res.json({
      customers: rows,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalCustomers / parseInt(limit, 10)),
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Lấy chi tiết 1 khách hàng (Admin)
// @route   GET /api/customers/:id
const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    // Lấy TẤT CẢ thông tin (bao gồm vé)
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'user'",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }
    res.json(sanitizeUser(result.rows[0])); // Xóa pass trước khi gửi
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khách hàng:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật khách hàng (Thêm Xu/Vé) (Admin)
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  const { id } = req.params;
  // Admin chỉ được cập nhật các trường này
  const {
    full_name,
    email,
    phone,
    coins,
    spin_tickets,
    box_keys,
    memory_plays,
    whac_plays,
    jump_plays,
    slice_plays,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET 
         full_name = $1, email = $2, phone = $3, coins = $4, 
         spin_tickets = $5, box_keys = $6, memory_plays = $7, 
         whac_plays = $8, jump_plays = $9, slice_plays = $10
       WHERE id = $11 AND role = 'user'
       RETURNING *`,
      [
        full_name,
        email,
        phone,
        coins,
        spin_tickets,
        box_keys,
        memory_plays,
        whac_plays,
        jump_plays,
        slice_plays,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }
    res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    if (error.code === "23505") {
      // Lỗi email trùng
      return res.status(400).json({ error: "Email này đã được sử dụng" });
    }
    console.error("Lỗi khi cập nhật khách hàng:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
};
