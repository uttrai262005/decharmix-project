const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // === SỬA LỖI 1: Lỗi "Không đăng nhập được" ===
      // Chúng ta kiểm tra tất cả các trường ID phổ biến (id, userId, user_id)
      // để đảm bảo luôn tìm thấy, bất kể bạn đặt tên gì trong authController.
      const userId = decoded.id || decoded.userId || decoded.user_id;

      if (!userId) {
        console.log("Token không chứa ID người dùng (id, userId, user_id).");
        return res
          .status(401)
          .json({ error: "Token không hợp lệ (không có ID)." });
      }

      console.log("Decoded token ID in authMiddleware:", userId);
      // === KẾT THÚC SỬA LỖI 1 ===

      // Lấy thông tin người dùng từ database (không lấy mật khẩu)
      const userResult = await pool.query(
        "SELECT id, email, role FROM users WHERE id = $1",
        [userId] // <-- Dùng biến 'userId' đã được kiểm tra
      );

      if (userResult.rows.length === 0) {
        console.log(`Người dùng với ID ${userId} không tìm thấy trong DB.`);
        return res.status(401).json({ error: "Người dùng không tồn tại." });
      }

      req.user = userResult.rows[0];
      next();
    } catch (error) {
      console.error("Lỗi xác thực token trong authMiddleware:", error);
      res.status(401).json({ error: "Token không hợp lệ." });
    }
  }

  if (!token) {
    res.status(401).json({ error: "Không có token, truy cập bị từ chối." });
  }
};

// === SỬA LỖI 2: THÊM HÀM adminMiddleware BỊ THIẾU ===
// Hàm này dùng để chặn người dùng thường truy cập vào route của Admin
// Nó phải được dùng *sau* hàm 'protect'
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ error: "Không có quyền truy cập. Yêu cầu quyền Admin." });
  }
};
// === KẾT THÚC SỬA LỖI 2 ===

// === SỬA LỖI 3: EXPORT CẢ HAI HÀM ===
module.exports = { protect, adminMiddleware };
