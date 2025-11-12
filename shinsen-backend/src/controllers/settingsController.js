const pool = require("../config/db");

// @desc    Lấy tất cả cài đặt (Admin)
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT setting_key, setting_value, description FROM shop_settings"
    );

    // Chuyển đổi mảng [ {key: 'X', value: 'Y'} ] thành object { X: { value: 'Y', ... } }
    const settings = rows.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
      };
      return acc;
    }, {});

    res.json(settings);
  } catch (error) {
    console.error("Lỗi khi lấy cài đặt:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật cài đặt (Admin)
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  // Mong đợi object { SHIPPING_FEE: '30000', COIN_REDEMPTION_PERCENT: '0.5' }
  const settingsToUpdate = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [key, value] of Object.entries(settingsToUpdate)) {
      // Bỏ qua nếu key không hợp lệ (an toàn)
      if (key === "SHIPPING_FEE" || key === "COIN_REDEMPTION_PERCENT") {
        await client.query(
          `UPDATE shop_settings 
           SET setting_value = $1, updated_at = NOW() 
           WHERE setting_key = $2`,
          [value, key]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Cập nhật cài đặt thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi cập nhật cài đặt:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
