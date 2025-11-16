const multer = require("multer");
const path = require("path");

// Cấu hình nơi lưu file tạm (ở thư mục 'uploads/')
// (Bạn hãy tạo thư mục 'uploads' ở gốc backend nhé)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // (Tạo tên file tạm duy nhất)
    cb(null, "vis-search-" + Date.now() + path.extname(file.originalname));
  },
});

// Cấu hình lọc file (Chỉ nhận ảnh)
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Lỗi: Chỉ chấp nhận file ảnh (jpeg, jpg, png)!");
  }
}

// (Middleware này tên là 'visualSearchUpload')
const visualSearchUpload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image"); // (Tên trường <input> sẽ là "image")

module.exports = visualSearchUpload;
