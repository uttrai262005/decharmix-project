// 1. Import các thư viện cần thiết
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Giúp đọc các biến trong file .env
const reviewRoutes = require("./src/routes/reviewRoutes"); // 2. Khởi tạo ứng dụng Express
const app = express();
app.use(express.static(path.join(__dirname, "shinsen-frontend")));
const gameRoutes = require("./src/routes/gameRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const PORT = process.env.PORT || 5000; // Lấy cổng từ file .env, nếu không có thì mặc định là 5000
const customerRoutes = require("./src/routes/customerRoutes");
const passport = require("passport");
const session = require("express-session");
require("./src/config/passport");
app.use(express.static("public"));

// 3. Cấu hình Middleware (Phần mềm trung gian)
app.use(cors()); // Cho phép frontend ở domain khác gọi API này (Cross-Origin Resource Sharing)
app.use(express.json()); // Giúp server có thể đọc và hiểu dữ liệu JSON được gửi lên
const voucherRoutes = require("./src/routes/voucherRoutes");
// 4. Định nghĩa Routes (Các tuyến đường API)
// Dòng này báo cho server biết: "Mọi yêu cầu có đường dẫn bắt đầu bằng '/api/products'
// thì hãy chuyển cho file productRoutes xử lý."
const productRoutes = require("./src/routes/productRoutes");
app.use(
  session({
    secret: process.env.SESSION_SECRET || "decharmix_secret_key", // Thêm 1 key bí mật vào .env
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/products", productRoutes);

// Route cơ bản để kiểm tra server có hoạt động không
app.get("/", (req, res) => {
  res.send("Chào mừng đến với API của Shinsen!");
});
const orderRoutes = require("./src/routes/orderRoutes");
app.use("/api/orders", orderRoutes);
const userRoutes = require("./src/routes/userRoutes");
app.use("/api/users", userRoutes);
const cartRoutes = require("./src/routes/cartRoutes");
app.use("/api/cart", cartRoutes);
const supplierRoutes = require("./src/routes/supplierRoutes");
app.use("/api/suppliers", supplierRoutes);
const batchRoutes = require("./src/routes/batchRoutes");
app.use("/api/batches", batchRoutes);
const traceRoutes = require("./src/routes/traceRoutes");
app.use("/api/trace", traceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/settings", settingsRoutes);
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "shinsen-frontend", "index.html"));
});
// 5. Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Backend server đang chạy trên cổng ${PORT}`);
});
