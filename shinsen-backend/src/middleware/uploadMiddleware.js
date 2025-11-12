const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // File sẽ được lưu vào thư mục 'public/uploads/avatars'
    // Bạn cần tạo các thư mục này thủ công: public -> uploads -> avatars
    cb(null, "public/uploads/avatars/");
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất để tránh trùng lặp
    // Tên file sẽ là: user-[userId]-[timestamp].[phần mở rộng]
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, "user-" + req.user.id + "-" + uniqueSuffix);
  },
});

// Kiểm tra loại file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn kích thước file 5MB
});

module.exports = upload;
