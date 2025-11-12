const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../config/db"); // <-- SỬA LỖI: Dùng '../config/db'
const { sanitizeUser } = require("../controllers/userController");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/auth/google/callback", // (Phải khớp với Google Console và userRoutes.js)
      scope: ["profile", "email"], // Chúng ta muốn lấy gì từ Google
    },
    async (accessToken, refreshToken, profile, done) => {
      // 'profile' là thông tin Google trả về
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatarUrl = profile.photos ? profile.photos[0].value : null;

      try {
        const client = await pool.connect();

        // 1. Kiểm tra xem google_id đã tồn tại chưa
        let userResult = await client.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId]
        );

        if (userResult.rows.length > 0) {
          // Đã tìm thấy, trả về user
          client.release();
          return done(null, sanitizeUser(userResult.rows[0]));
        }

        // 2. Nếu google_id chưa có, kiểm tra xem email đã tồn tại chưa
        userResult = await client.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (userResult.rows.length > 0) {
          // Email đã tồn tại (user đăng ký bằng email/pass trước đó)
          // => Cập nhật google_id cho họ
          const updatedUser = await client.query(
            "UPDATE users SET google_id = $1, avatar_url = $2 WHERE email = $3 RETURNING *",
            [googleId, avatarUrl, email]
          );
          client.release();
          return done(null, sanitizeUser(updatedUser.rows[0]));
        }

        // 3. Nếu không có gì, tạo user mới
        // (Gộp logic 7 vé game của bạn vào đây)
        const newUser = await client.query(
          `INSERT INTO users (full_name, email, google_id, avatar_url, role, coins, spin_tickets, box_keys, memory_plays, whac_plays, jump_plays, claw_plays, slice_plays) 
           VALUES ($1, $2, $3, $4, 'user', 0, 1, 1, 1, 1, 1, 1, 1) 
           RETURNING *`,
          [name, email, googleId, avatarUrl]
        );
        client.release();
        return done(null, sanitizeUser(newUser.rows[0]));
      } catch (error) {
        console.error("Lỗi khi xác thực Passport:", error);
        return done(error, false);
      }
    }
  )
);

// (Passport cần 2 hàm này, dù chúng ta không dùng session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    done(null, sanitizeUser(rows[0]));
  } catch (error) {
    done(error, null);
  }
});
