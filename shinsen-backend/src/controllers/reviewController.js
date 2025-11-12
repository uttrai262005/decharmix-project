const pool = require("../config/db");

// @desc    Thêm một review mới cho sản phẩm
const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;

  if (!req.user || !req.user.id) {
    return res
      .status(401)
      .json({ error: "Xác thực không hợp lệ, không tìm thấy người dùng." });
  }
  const userId = req.user.id;

  if (!productId || !rating) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp sản phẩm và số sao đánh giá." });
  }

  try {
    const newReview = await pool.query(
      "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
      [productId, userId, rating, comment]
    );
    res.status(201).json(newReview.rows[0]);
  } catch (error) {
    console.error("--- LỖI KHI THÊM REVIEW ---");
    console.error(error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// @desc    Lấy tất cả review của một sản phẩm
const getReviewsForProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(reviews.rows);
  } catch (error) {
    // PHẦN LOG LỖI QUAN TRỌNG
    console.error("--- LỖI DATABASE KHI LẤY DANH SÁCH REVIEW ---");
    console.error(error); // In ra lỗi chi tiết từ PostgreSQL
    console.error("-------------------------------------------");
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

module.exports = {
  addReview,
  getReviewsForProduct,
};
