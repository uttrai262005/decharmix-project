const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// (Chúng ta không cần Resend ở đây)

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Hàm tiện ích: Xóa password (Giờ sẽ được export)
const sanitizeUser = (user) => {
  if (user) {
    delete user.password;
  }
  return user;
};

// @desc    Đăng ký người dùng mới (Giữ nguyên code của bạn)
const registerUser = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin." });
  }
  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Email đã được sử dụng." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // (Giữ logic 7 vé game của bạn)
    const newUser = await pool.query(
      `INSERT INTO users (full_name, email, password, role, coins, spin_tickets, box_keys, memory_plays, whac_plays, jump_plays, claw_plays, slice_plays) 
       VALUES ($1, $2, $3, 'user', 0, 1, 1, 1, 1, 1, 1, 1) 
       RETURNING *`,
      [name, email, hashedPassword]
    );

    const user = newUser.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// @desc    Đăng nhập người dùng (ĐÃ NÂNG CẤP)
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác." });
    }

    const user = userResult.rows[0];

    // === THÊM LOGIC KIỂM TRA GOOGLE ===
    if (!user.password && user.google_id) {
      return res.status(401).json({
        error:
          "Tài khoản này được đăng ký qua Google. Vui lòng đăng nhập bằng Google.",
      });
    }
    // ==================================

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Email hoặc mật khẩu không chính xác." });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// @desc    Lấy thông tin cá nhân (Giữ nguyên code của bạn)
const getUserProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }
    res.json(sanitizeUser(result.rows[0]));
  } catch (error) {
    console.error("Lỗi khi lấy profile người dùng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật thông tin cá nhân (Giữ nguyên code của bạn)
const updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { fullName, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone = $2 WHERE id = $3 
       RETURNING *`,
      [fullName, phone, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng." });
    }
    res.json({
      message: "Cập nhật thông tin thành công!",
      user: sanitizeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật profile:", error);
    res.status(500).json({ error: "Lỗi server." });
  }
};

// @desc    Upload Avatar (Giữ nguyên code của bạn)
const uploadAvatar = async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng chọn một file ảnh." });
  }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  try {
    const result = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2 
       RETURNING *`,
      [avatarUrl, userId]
    );
    res.json({
      message: "Upload avatar thành công!",
      user: sanitizeUser(result.rows[0]),
    });
  } catch (error) {
    console.error("Lỗi khi upload avatar:", error);
    res.status(500).json({ error: "Lỗi server khi lưu avatar." });
  }
};

// === HÀM MỚI: XỬ LÝ KHI GOOGLE ĐĂNG NHẬP XONG ===
const googleLoginCallback = (req, res) => {
  // Passport đã xác thực xong, user được gán vào req.user
  const user = req.user;
  if (!user) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=GoogleAuthFailed`
    );
  }

  // Tạo JWT của chúng ta
  const token = generateToken(user.id, user.role);

  // Gửi token VÀ user data về frontend qua URL
  const userJson = encodeURIComponent(JSON.stringify(user));

  res.redirect(
    `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${userJson}`
  );
};
// ============================================

// === CẬP NHẬT EXPORTS ===
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  googleLoginCallback,
  sanitizeUser,
};
