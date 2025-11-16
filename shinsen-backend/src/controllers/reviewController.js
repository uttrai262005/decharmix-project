const pool = require("../config/db");

// === 1. BỎ HOÀN TOÀN THƯ VIỆN ML (VNTK) ===
// const vntk = require("vntk");
// const analyzer = new vntk.Sentiment();
// ======================================

// === 2. TẠO HÀM "DỊCH SAO" CỦA CHÚNG TA ===
// (Đây là "Rule-Based Model" của chúng ta)
const convertRatingToScore = (rating) => {
  switch (rating) {
    case 5:
      return 2; // Rất Tích cực
    case 4:
      return 1; // Tích cực
    case 3:
      return 0; // Trung lập (Vòng đẹp mà dễ lỏng -> 3 sao)
    case 2:
      return -1; // Tiêu cực
    case 1:
      return -2; // Rất Tiêu cực (BAD -> 1 sao)
    default:
      return 0;
  }
};
// =======================================

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

  // === 3. LẤY ĐIỂM TỪ HÀM "DỊCH SAO" ===
  let sentimentScore = convertRatingToScore(rating);
  // ===================================

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // === 4. LƯU REVIEW VÀ ĐIỂM ML (TỪ SAO) ===
    const reviewQuery = `
      INSERT INTO reviews (product_id, user_id, rating, comment, sentiment_score) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const newReview = await client.query(reviewQuery, [
      productId,
      userId,
      rating,
      comment,
      sentimentScore, // <-- Lưu điểm ML (vd: -2)
    ]);
    const newReviewId = newReview.rows[0].id;

    // === 5. CẬP NHẬT LẠI BẢNG 'products' (Giữ nguyên logic) ===
    // (Logic này vẫn đúng 100%)
    const statsQuery = `
      WITH review_stats AS (
        SELECT
          AVG(rating)::FLOAT AS avg_rating,
          COUNT(id) AS review_count,
          COUNT(CASE WHEN sentiment_score > 0 THEN 1 END) AS positive_count,
          COUNT(CASE WHEN sentiment_score < 0 THEN 1 END) AS negative_count,
          COUNT(CASE WHEN sentiment_score = 0 THEN 1 END) AS neutral_count
        FROM reviews
        WHERE product_id = $1
      )
      UPDATE products p
      SET
        average_rating = rs.avg_rating,
        review_count = rs.review_count,
        sentiment_summary = jsonb_build_object(
          'positive', rs.positive_count,
          'negative', rs.negative_count,
          'neutral', rs.neutral_count
        )
      FROM review_stats rs
      WHERE p.id = $1;
    `;
    await client.query(statsQuery, [productId]);

    await client.query("COMMIT");

    // === 6. TRẢ VỀ REVIEW MỚI (CÓ KÈM TÊN USER) ===
    const result = await client.query(
      `SELECT r.*, u.full_name as user_name 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = $1`,
      [newReviewId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("--- LỖI KHI THÊM REVIEW (ML) ---");
    console.error(error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  } finally {
    client.release();
  }
};

// @desc    Lấy tất cả review của một sản phẩm (Giữ nguyên)
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
    console.error("--- LỖI DATABASE KHI LẤY DANH SÁCH REVIEW ---");
    console.error(error);
    console.error("-------------------------------------------");
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

module.exports = {
  addReview,
  getReviewsForProduct,
};
