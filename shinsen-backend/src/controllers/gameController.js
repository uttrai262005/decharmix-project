const pool = require("../config/db");

// @desc    Lấy thông tin game của user (TẤT CẢ VÉ)
// @route   GET /api/game/stats
const getGameStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // Lấy tất cả 7 loại vé + xu (Bỏ 'claw_plays' như bạn yêu cầu)
    const { rows } = await pool.query(
      "SELECT coins, spin_tickets, box_keys, memory_plays, whac_plays, jump_plays, slice_plays FROM users WHERE id = $1",
      [userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin game:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Hành động "Quay" Vòng quay
// @route   POST /api/game/spin
const spinWheel = async (req, res) => {
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    // Lấy giải thưởng từ CSDL (thay vì code cứng)
    const prizeRes = await client.query("SELECT * FROM lucky_wheel_prizes");
    const prizes = prizeRes.rows; // Đây là 8 múi từ CSDL

    await client.query("BEGIN");
    const userRes = await client.query(
      "SELECT spin_tickets FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    );
    if (userRes.rows[0].spin_tickets <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Bạn đã hết lượt quay." });
    }
    await client.query(
      "UPDATE users SET spin_tickets = spin_tickets - 1 WHERE id = $1",
      [userId]
    );

    // Logic quay số dựa trên 'probability' từ CSDL
    const random = Math.random();
    let cumulativeProbability = 0;
    let wonPrize = null;

    for (const prize of prizes) {
      cumulativeProbability += parseFloat(prize.probability);
      if (random <= cumulativeProbability) {
        wonPrize = prize;
        break;
      }
    }

    // Xử lý giải thưởng
    if (!wonPrize) {
      // Trường hợp dự phòng nếu tổng tỷ lệ < 1
      wonPrize = prizes.find((p) => p.type === "fail") || prizes[0];
    }

    if (wonPrize.type === "xu") {
      await client.query("UPDATE users SET coins = coins + $1 WHERE id = $2", [
        Number(wonPrize.value),
        userId,
      ]);
    } else if (wonPrize.type === "voucher") {
      // (Giả sử 'value' của voucher là MÃ CODE, không phải ID)
      const voucherRes = await client.query(
        "SELECT id FROM vouchers WHERE code = $1",
        [wonPrize.value]
      );
      if (voucherRes.rows.length > 0) {
        const voucherId = voucherRes.rows[0].id;
        await client.query(
          "INSERT INTO user_vouchers (user_id, voucher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, voucherId]
        );
      }
    } else if (wonPrize.type === "spin_ticket") {
      // (Nếu bạn có giải 'thêm lượt')
      await client.query(
        "UPDATE users SET spin_tickets = spin_tickets + $1 WHERE id = $2",
        [Number(wonPrize.value), userId]
      );
    }

    await client.query("COMMIT");
    res.json({ prize_index: wonPrize.slice_index, prize_name: wonPrize.name }); // Trả về slice_index
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi quay:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};

// @desc    Hành động "Mở Hộp Quà"
// @route   POST /api/game/open-box
const openGiftBox = async (req, res) => {
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    // Lấy giải thưởng Hộp Quà từ CSDL
    const prizeRes = await client.query("SELECT * FROM gift_box_prizes");
    const prizes = prizeRes.rows;

    await client.query("BEGIN");
    const userRes = await client.query(
      "SELECT box_keys FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    );
    if (userRes.rows[0].box_keys <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Bạn đã hết chìa khóa mở hộp." });
    }
    await client.query(
      "UPDATE users SET box_keys = box_keys - 1 WHERE id = $1",
      [userId]
    );

    // Logic mở hộp dựa trên 'probability'
    const random = Math.random();
    let cumulativeProbability = 0;
    let wonPrize = null;
    for (const prize of prizes) {
      cumulativeProbability += parseFloat(prize.probability);
      if (random <= cumulativeProbability) {
        wonPrize = prize;
        break;
      }
    }

    if (!wonPrize) {
      // Dự phòng
      wonPrize = prizes[0];
    }

    // Xử lý thưởng
    if (wonPrize.type === "xu") {
      await client.query("UPDATE users SET coins = coins + $1 WHERE id = $2", [
        Number(wonPrize.value),
        userId,
      ]);
    } else if (wonPrize.type === "voucher") {
      const voucherRes = await client.query(
        "SELECT id FROM vouchers WHERE code = $1",
        [wonPrize.value]
      );
      if (voucherRes.rows.length > 0) {
        await client.query(
          "INSERT INTO user_vouchers (user_id, voucher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, voucherRes.rows[0].id]
        );
      }
    } else if (wonPrize.type === "ticket") {
      // Cộng 1 vé cho loại vé được chỉ định (vd: 'spin_tickets')
      await client.query(
        `UPDATE users SET ${pool.escapeIdentifier(
          wonPrize.value
        )} = ${pool.escapeIdentifier(wonPrize.value)} + 1 WHERE id = $1`,
        [userId]
      );
    }

    await client.query("COMMIT");
    res.json({
      prize_name: wonPrize.name,
      prize_type: wonPrize.type,
      prize_value: wonPrize.value,
      image_url: wonPrize.image_url, // Trả về ảnh
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi mở hộp:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};

// --- HÀM CHUNG CHO GAME KỸ NĂNG ---
// (Thay thế 4 hàm game kỹ năng của bạn bằng 1 hàm này)
const playSkillGame = async (req, res, gameKey, ticketColumn) => {
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Trừ vé
    const userRes = await client.query(
      `SELECT ${ticketColumn} FROM users WHERE id = $1 FOR UPDATE`,
      [userId]
    );
    const ticketCount = userRes.rows[0][ticketColumn];

    if (ticketCount <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Bạn đã hết vé chơi game này." });
    }

    await client.query(
      `UPDATE users SET ${ticketColumn} = ${ticketColumn} - 1 WHERE id = $1`,
      [userId]
    );

    // 2. Lấy phần thưởng (từ CSDL)
    const rewardRes = await client.query(
      "SELECT * FROM game_skill_rewards WHERE game_key = $1",
      [gameKey]
    );

    if (rewardRes.rows.length === 0) {
      throw new Error(`Không tìm thấy phần thưởng cho ${gameKey}`);
    }

    const reward = rewardRes.rows[0];
    let prizeName = "";

    // 3. Trao thưởng
    if (reward.reward_type === "xu") {
      await client.query("UPDATE users SET coins = coins + $1 WHERE id = $2", [
        Number(reward.reward_value),
        userId,
      ]);
      prizeName = `${reward.reward_value} Decharmix Xu`;
    } else if (reward.reward_type === "voucher") {
      const voucherRes = await client.query(
        "SELECT id FROM vouchers WHERE code = $1",
        [reward.reward_value]
      );
      if (voucherRes.rows.length > 0) {
        await client.query(
          "INSERT INTO user_vouchers (user_id, voucher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, voucherRes.rows[0].id]
        );
        prizeName = `Voucher ${reward.reward_value}`;
      }
    }

    await client.query("COMMIT");
    res.json({
      prize_name: prizeName,
      prize_type: reward.reward_type,
      prize_value: reward.reward_value,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Lỗi khi chơi ${gameKey}:`, error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};

// === 4 ROUTE GAME KỸ NĂNG (GỌI HÀM CHUNG) ===
const playMemoryGame = (req, res) =>
  playSkillGame(req, res, "memory_match", "memory_plays");
const playWhacGame = (req, res) =>
  playSkillGame(req, res, "whac_a_charm", "whac_plays");
const playJumpGame = (req, res) =>
  playSkillGame(req, res, "charm_jump", "jump_plays");
const playSliceGame = (req, res) =>
  playSkillGame(req, res, "charm_slice", "slice_plays");

// (Hàm 'playClawGame' của bạn đã bị xóa theo yêu cầu)

// ===========================================
// === API CHO ADMIN (CODE TỪ TIN NHẮN 121) ===
// ===========================================

// @desc    Lấy cài đặt Vòng Quay May Mắn (Admin)
// @route   GET /api/game/admin/lucky-wheel
const getLuckyWheelSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lucky_wheel_prizes ORDER BY slice_index ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy cài đặt vòng quay:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật Vòng Quay May Mắn (Admin)
// @route   PUT /api/game/admin/lucky-wheel
const updateLuckyWheelSettings = async (req, res) => {
  const { prizes } = req.body; // Mong đợi nhận 1 mảng [8 giải]

  if (!prizes || prizes.length !== 8) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ, cần 8 múi." });
  }

  // Kiểm tra tổng tỷ lệ
  const totalProbability = prizes.reduce(
    (sum, prize) => sum + parseFloat(prize.probability),
    0
  );
  if (Math.abs(totalProbability - 1.0) > 0.01) {
    // (Cho phép sai số 1%)
    return res.status(400).json({
      error: `Tổng tỷ lệ phải là 1 (hoặc 100%), hiện tại là ${totalProbability}`,
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const prize of prizes) {
      await client.query(
        `UPDATE lucky_wheel_prizes 
         SET name = $1, type = $2, value = $3, probability = $4
         WHERE slice_index = $5`,
        [
          prize.name,
          prize.type,
          prize.value,
          prize.probability,
          prize.slice_index,
        ]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Cập nhật Vòng quay thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi cập nhật vòng quay:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};

// @desc    Lấy cài đặt 4 Game Kỹ Năng (Admin)
// @route   GET /api/game/admin/skill-rewards
const getSkillGameRewards = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM game_skill_rewards");
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy thưởng game kỹ năng:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật 4 Game Kỹ Năng (Admin)
// @route   PUT /api/game/admin/skill-rewards
const updateSkillGameRewards = async (req, res) => {
  const { rewards } = req.body; // Mong đợi 1 mảng [4 game]

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const game of rewards) {
      await client.query(
        `UPDATE game_skill_rewards 
         SET reward_type = $1, reward_value = $2
         WHERE game_key = $3`,
        [game.reward_type, game.reward_value, game.game_key]
      );
    }
    await client.query("COMMIT");
    res.json({ message: "Cập nhật thưởng game thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi cập nhật thưởng game:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  } finally {
    client.release();
  }
};
const getGiftBoxPrizes = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM gift_box_prizes ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy quà hộp quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Thêm quà mới vào Hộp Quà (Admin)
// @route   POST /api/games/admin/gift-box
const createGiftBoxPrize = async (req, res) => {
  const { name, type, value, image_url, probability } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO gift_box_prizes (name, type, value, image_url, probability)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, value, image_url, probability]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi thêm quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật một món quà (Admin)
// @route   PUT /api/games/admin/gift-box/:id
const updateGiftBoxPrize = async (req, res) => {
  const { id } = req.params;
  const { name, type, value, image_url, probability } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gift_box_prizes 
       SET name = $1, type = $2, value = $3, image_url = $4, probability = $5
       WHERE id = $6
       RETURNING *`,
      [name, type, value, image_url, probability, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy vật phẩm" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Xóa một món quà (Admin)
// @route   DELETE /api/games/admin/gift-box/:id
const deleteGiftBoxPrize = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM gift_box_prizes WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy vật phẩm" });
    }
    res.json({ message: "Xóa vật phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};
module.exports = {
  // === USER ===
  getGameStats,
  spinWheel,
  openGiftBox,
  playMemoryGame,
  playWhacGame,
  playJumpGame,
  // playClawGame, // (Đã xóa)
  playSliceGame,

  // === ADMIN ===
  getLuckyWheelSettings,
  updateLuckyWheelSettings,
  getSkillGameRewards,
  updateSkillGameRewards,

  getGiftBoxPrizes,
  createGiftBoxPrize,
  updateGiftBoxPrize,
  deleteGiftBoxPrize,
};
