// Middleware này chạy SAU hàm 'protect'
const admin = (req, res, next) => {
  // Hàm 'protect' đã thêm req.user
  if (req.user && req.user.role === "admin") {
    next(); // Là admin, cho qua
  } else {
    res.status(403); // 403 Forbidden (Cấm)
    throw new Error("Không có quyền truy cập Admin");
  }
};

module.exports = { admin };
