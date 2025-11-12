const pool = require("../config/db");
const axios = require("axios");
const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const CryptoJS = require("crypto-js");
const { Resend } = require("resend");

// Khởi tạo Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// === HÀM GỬI EMAIL QUÀ TẶNG ===
const sendGiftEmail = async (
  recipientEmail,
  recipientName,
  senderName,
  message,
  claimToken
) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const claimUrl = `${frontendUrl}/claim-gift/${claimToken}`;

  try {
    const data = await resend.emails.send({
      from: "Decharmix <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Bạn có một món quà từ ${senderName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ffe2f2; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #fff5f9; padding: 20px; text-align: center;">
            <h2 style="color: #be5985;">Bạn có một món quà!</h2>
          </div>
          <div style="padding: 30px;">
            <h3 style="color: #be5985;">Chào ${recipientName},</h3>
            <p>Bạn vừa nhận được một món quà từ <strong>${senderName}</strong>!</p>
            <p>Với lời nhắn:</p>
            <blockquote style="border-left: 4px solid #fce7f3; padding: 10px 15px; font-style: italic; background: #fff5f9; border-radius: 4px;">
              ${message}
            </blockquote>
            <p style="margin-top: 25px;">Hãy bấm vào nút bên dưới để "mở quà" và điền địa chỉ nhận hàng nhé:</p>
            <a href="${claimUrl}" style="background-color: #fe98bf; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin: 10px 0;">
              Nhận Quà Ngay
            </a>
            <p style="margin-top: 25px;">Trân trọng,<br/>Đội ngũ Decharmix</p>
          </div>
        </div>
      `,
    });
    console.log(`Đã gửi email quà tặng tới ${recipientEmail}`);
  } catch (error) {
    console.error("Lỗi khi gửi email Resend:", error);
  }
};

// (Các hàm generateVietQRString, crc16 giữ nguyên)
const crc16 = (data) => {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ("0000" + (crc & 0xffff).toString(16).toUpperCase()).slice(-4);
};
const generateVietQRString = (bankId, accountNumber, amount, orderInfo) => {
  const createTLV = (tag, value) => {
    const length = value.length.toString().padStart(2, "0");
    return `${tag}${length}${value}`;
  };
  const bankInfo = createTLV("00", "A000000727") + createTLV("01", "QRIBFTTA");
  const consumerInfo = createTLV("00", bankId) + createTLV("01", accountNumber);
  const merchantAccountInfo = createTLV("38", bankInfo + consumerInfo);
  const transactionCurrency = createTLV("53", "704");
  const transactionAmount = createTLV("54", amount.toString());
  const countryCode = createTLV("58", "VN");
  const additionalInfo = createTLV("62", createTLV("08", orderInfo));
  const payload = `000201010212${merchantAccountInfo}${transactionCurrency}${transactionAmount}${countryCode}${additionalInfo}6304`;
  const checksum = crc16(payload);
  return `${payload}${checksum}`;
};

// === HÀM TÍNH TỔNG GỐC AN TOÀN ===
const calculateCartTotal = async (cartItems, client) => {
  let total = 0;
  if (!cartItems || cartItems.length === 0) {
    return total;
  }
  const productIds = cartItems.map((item) => item.product_id);
  const safeProductIds = productIds.filter((id) => id);
  if (safeProductIds.length === 0) return 0;

  const { rows: products } = await client.query(
    "SELECT id, price, discount_price FROM products WHERE id = ANY($1) FOR UPDATE",
    [safeProductIds]
  );
  const priceMap = new Map();
  products.forEach((p) => {
    priceMap.set(p.id, p.discount_price || p.price);
  });
  for (const item of cartItems) {
    const price = priceMap.get(item.product_id);
    if (price) {
      total += price * item.quantity;
    } else {
      console.warn(
        `Sản phẩm ID ${item.product_id} không tìm thấy giá khi tính tổng.`
      );
    }
  }
  return total;
};

// --- HÀM CHÍNH: TẠO ĐƠN HÀNG (ĐÃ NÂNG CẤP) ---
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    cartItems,
    total,
    shippingInfo,
    paymentMethod,
    voucherCode,
    discountAmount,
    coinsUsed,
    coinDiscountAmount,
    isDigitalGift,
    recipientName,
    recipientEmail,
    recipientMessage,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Giỏ hàng của bạn đang trống." });
  }
  if (!isDigitalGift && !shippingInfo) {
    return res.status(400).json({ error: "Thiếu thông tin giao hàng." });
  }
  if (isDigitalGift && (!recipientName || !recipientEmail)) {
    return res
      .status(400)
      .json({ error: "Thiếu tên hoặc email người nhận quà." });
  }

  const client = await pool.connect();
  try {
    const settingsRes = await client.query(
      "SELECT setting_key, setting_value FROM shop_settings"
    );
    const settings = settingsRes.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    const coinRedemptionRate = parseFloat(
      settings.COIN_REDEMPTION_PERCENT || 0.5
    );
    await client.query("BEGIN");

    // Lấy Tên + Xu của người gửi
    const userRes = await client.query(
      "SELECT full_name, coins FROM users WHERE id = $1 FOR UPDATE",
      [userId]
    );
    if (userRes.rows.length === 0) throw new Error("Người dùng không tồn tại.");

    const senderName = userRes.rows[0].full_name;
    const userCoins = userRes.rows[0].coins;

    // (Logic kiểm tra Xu và Tổng tiền - Giữ nguyên)
    const originalTotal = await calculateCartTotal(cartItems, client);
    const maxCoinsAllowed = Math.floor(originalTotal * coinRedemptionRate);
    const safeCoinsUsed = Number(coinsUsed) || 0;
    if (safeCoinsUsed > userCoins) {
      throw new Error("Bạn không đủ xu để thực hiện giao dịch.");
    }
    if (safeCoinsUsed > maxCoinsAllowed) {
      throw new Error(
        `Bạn chỉ được dùng tối đa ${maxCoinsAllowed} xu (50% giá trị đơn hàng)`
      );
    }

    // (Chuẩn bị dữ liệu đơn hàng - Giữ nguyên)
    let fullAddress = null;
    let phone = null;
    let fullName = null;
    let status = "processing";
    let claimToken = null;

    if (isDigitalGift) {
      status = "pending_recipient";
      claimToken = crypto.randomBytes(32).toString("hex");
      fullName = recipientName;
    } else {
      fullAddress = `${shippingInfo.address}, ${shippingInfo.ward}, ${shippingInfo.district}, ${shippingInfo.province}`;
      phone = shippingInfo.phone;
      fullName = shippingInfo.name;
      status = paymentMethod !== "cod" ? "pending_payment" : "processing";
    }

    // (INSERT VÀO DATABASE - Giữ nguyên)
    const orderQuery = `
      INSERT INTO orders (
        user_id, total_price, shipping_address, phone_number, full_name, 
        status, payment_method, voucher_code, discount_amount, coin_discount_amount,
        is_digital_gift, recipient_name, recipient_email, recipient_message, claim_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id;
    `;
    const orderResult = await client.query(orderQuery, [
      userId,
      total,
      fullAddress,
      phone,
      fullName,
      status,
      paymentMethod,
      voucherCode,
      discountAmount || 0,
      coinDiscountAmount || 0,
      isDigitalGift || false,
      recipientName || null,
      recipientEmail || null,
      recipientMessage || null,
      claimToken,
    ]);

    const newOrderId = orderResult.rows[0].id;

    // (Tạo order_code, Lưu order_items, Xóa giỏ hàng, Dùng voucher, Trừ xu, Tặng vé game... - Giữ nguyên)
    const orderCode = `DECHARMIX${newOrderId}`;
    await client.query(`UPDATE orders SET order_code = $1 WHERE id = $2`, [
      orderCode,
      newOrderId,
    ]);

    for (const item of cartItems) {
      const price = item.discount_price || item.price;
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [newOrderId, item.product_id, item.quantity, price]
      );
    }

    const cartResult = await client.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );
    if (cartResult.rows.length > 0) {
      const cartId = cartResult.rows[0].id;
      await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    }

    if (voucherCode) {
      await client.query(
        `UPDATE user_vouchers uv SET is_used = TRUE FROM vouchers v
         WHERE uv.voucher_id = v.id AND uv.user_id = $1 AND v.code = $2`,
        [userId, voucherCode]
      );
    }

    if (safeCoinsUsed > 0) {
      await client.query(`UPDATE users SET coins = coins - $1 WHERE id = $2`, [
        safeCoinsUsed,
        userId,
      ]);
    }

    await client.query(
      `UPDATE users SET 
         spin_tickets = spin_tickets + 1, box_keys = box_keys + 1, memory_plays = memory_plays + 1,
         whac_plays = whac_plays + 1, jump_plays = jump_plays + 1, claw_plays = claw_plays + 1,
         slice_plays = slice_plays + 1
       WHERE id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    // GỬI MAIL (nếu là quà)
    if (isDigitalGift && claimToken && recipientEmail) {
      await sendGiftEmail(
        recipientEmail,
        recipientName,
        senderName,
        recipientMessage,
        claimToken
      );
    }

    // (Xử lý các cổng thanh toán - Giữ nguyên)
    if (paymentMethod === "bank") {
      const vietQRString = generateVietQRString(
        "970436",
        "1036614880",
        total,
        orderCode
      );
      return res.status(201).json({ orderCode, vietQRString });
    } else if (paymentMethod === "momo") {
      var partnerCode = "MOMO",
        accessKey = "F8BBA842ECF85",
        secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      var requestId = partnerCode + new Date().getTime(),
        orderId = orderCode,
        orderInfo = "pay with MoMo";
      var redirectUrl = "https://momo.vn/return",
        ipnUrl = "https://callback.url/notify",
        amount = total.toString();
      var requestType = "captureWallet",
        extraData = "";
      var rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
      var signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");
      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "en",
      });
      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        { headers: { "Content-Type": "application/json" } }
      );
      return res.status(200).json(response.data);
    } else if (paymentMethod === "vnpay") {
      process.env.TZ = "Asia/Ho_Chi_Minh";
      const createDate = moment(new Date()).format("YYYYMMDDHHmmss");
      const ipAddr = "127.0.0.1";
      const tmnCode = process.env.VNP_TMN_CODE,
        secretKey = process.env.VNP_HASH_SECRET;
      let vnpUrl = process.env.VNP_URL;
      const returnUrl = "http://localhost:3000/order-result";
      let vnp_Params = {};
      vnp_Params["vnp_Version"] = "2.1.0";
      vnp_Params["vnp_Command"] = "pay";
      vnp_Params["vnp_TmnCode"] = tmnCode;
      vnp_Params["vnp_Locale"] = "vn";
      vnp_Params["vnp_CurrCode"] = "VND";
      vnp_Params["vnp_TxnRef"] = orderCode;
      vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang " + orderCode;
      vnp_Params["vnp_OrderType"] = "other";
      vnp_Params["vnp_Amount"] = total * 100;
      vnp_Params["vnp_ReturnUrl"] = returnUrl;
      vnp_Params["vnp_IpAddr"] = ipAddr;
      vnp_Params["vnp_CreateDate"] = createDate;
      vnp_Params = Object.keys(vnp_Params)
        .sort()
        .reduce((acc, key) => {
          acc[key] = vnp_Params[key];
          return acc;
        }, {});
      const signData = qs.stringify(vnp_Params, { format: "RFC1738" });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      vnpUrl += "?" + qs.stringify(vnp_Params, { format: "RFC1738" });
      return res.status(201).json({ payUrl: vnpUrl });
    } else if (paymentMethod === "zalopay") {
      const app_id = process.env.ZALOPAY_APP_ID,
        key1 = process.env.ZALOPAY_KEY1;
      const zaloPayEndpoint = "https://sb-openapi.zalopay.vn/v2/create";
      const embed_data = { redirecturl: "http://localhost:3000/order-result" };
      const transID = Math.floor(Math.random() * 1000000);
      const app_trans_id = `${moment().format(
        "YYMMDD"
      )}_${orderCode}_${transID}`;
      const order = {
        app_id: app_id,
        app_trans_id: app_trans_id,
        app_user: "user123",
        app_time: Date.now(),
        item: JSON.stringify([]),
        embed_data: JSON.stringify(embed_data),
        amount: total,
        description: `Decharmix - Thanh toan don hang #${orderCode}`,
        bank_code: "zalopayapp",
      };
      const data =
        app_id +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;
      order.mac = CryptoJS.HmacSHA256(data, key1).toString();
      const response = await axios.post(zaloPayEndpoint, null, {
        params: order,
      });
      return res.status(201).json({ payUrl: response.data.order_url });
    } else {
      return res.status(201).json({
        message: "Tạo đơn hàng thành công!",
        orderCode: orderCode,
      });
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(
      "Lỗi khi tạo đơn hàng:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: error.message || "Lỗi server, không thể tạo đơn hàng." });
  } finally {
    client.release();
  }
};

// === HÀM LẤY THÔNG TIN QUÀ (CÔNG KHAI) ===
const getGiftDetailsByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { rows } = await pool.query(
      `SELECT 
         o.recipient_name, o.recipient_message, o.status, u.full_name AS sender_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.claim_token = $1`,
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Link nhận quà không hợp lệ." });
    }
    const order = rows[0];
    if (order.status !== "pending_recipient") {
      return res.status(400).json({ error: "Quà này đã được nhận rồi!" });
    }
    res.json({
      senderName: order.sender_name,
      recipientName: order.recipient_name,
      message: order.recipient_message,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// === HÀM NHẬN QUÀ (CÔNG KHAI) ===
const claimGift = async (req, res) => {
  const { token, shippingInfo } = req.body;
  if (!token || !shippingInfo) {
    return res.status(400).json({ error: "Thiếu thông tin." });
  }
  const { address, ward, district, province, phone } = shippingInfo;
  if (!address || !ward || !district || !province || !phone) {
    return res
      .status(400)
      .json({ error: "Vui lòng điền đầy đủ địa chỉ nhận hàng." });
  }
  const fullAddress = `${address}, ${ward}, ${district}, ${province}`;
  try {
    const { rows } = await pool.query(
      "SELECT id, status FROM orders WHERE claim_token = $1",
      [token]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Link nhận quà không hợp lệ." });
    }
    if (rows[0].status !== "pending_recipient") {
      return res.status(400).json({ error: "Quà này đã được nhận rồi!" });
    }
    await pool.query(
      `UPDATE orders SET 
         shipping_address = $1, 
         phone_number = $2, 
         status = 'processing', 
         claim_token = NULL
       WHERE claim_token = $3`,
      [fullAddress, phone, token]
    );
    res.status(200).json({
      message: "Nhận quà thành công! Decharmix sẽ sớm giao hàng tới bạn.",
    });
  } catch (error) {
    console.error("Lỗi khi nhận quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// === HÀM ÁP DỤNG VOUCHER (Code cũ của bạn) ===
const applyVoucher = async (req, res) => {
  const userId = req.user.id;
  const { code, cartTotal } = req.body;
  try {
    const voucherRes = await pool.query(
      `
      SELECT v.* FROM vouchers v
      JOIN user_vouchers uv ON v.id = uv.voucher_id
      WHERE uv.user_id = $1 
      AND v.code = $2 
      AND uv.is_used = FALSE
      AND v.end_date > NOW()
      AND v.is_active = TRUE
    `,
      [userId, code]
    );
    if (voucherRes.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Bạn không có voucher này hoặc voucher đã hết hạn." });
    }
    const voucher = voucherRes.rows[0];
    if (cartTotal < voucher.min_order_value) {
      return res.status(400).json({
        error: `Voucher này yêu cầu đơn hàng tối thiểu ${Number(
          voucher.min_order_value
        ).toLocaleString("vi-VN")} ₫`,
      });
    }
    let discountAmount = 0;
    if (voucher.type === "fixed") {
      discountAmount = Number(voucher.value);
    } else if (voucher.type === "percent") {
      discountAmount = (cartTotal * Number(voucher.value)) / 100;
      if (
        voucher.max_discount &&
        discountAmount > Number(voucher.max_discount)
      ) {
        discountAmount = Number(voucher.max_discount);
      }
    } else if (voucher.type === "shipping") {
      discountAmount = 30000; // Giả định phí ship 30k
    }
    const newTotal = cartTotal - discountAmount;
    res.json({
      message: "Áp dụng voucher thành công!",
      discountAmount: discountAmount,
      newTotal: newTotal < 0 ? 0 : newTotal,
      voucherCode: voucher.code,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng voucher:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// === CÁC HÀM WEBHOOK (Code cũ của bạn) ===
const handleMomoWebhook = async (req, res) => {
  const { orderId, amount, resultCode } = req.body;
  if (resultCode === 0) {
    try {
      const orderResult = await pool.query(
        "SELECT id FROM orders WHERE order_code = $1",
        [orderId]
      );
      if (orderResult.rows.length > 0) {
        const order_id_num = orderResult.rows[0].id;
        await pool.query(
          "UPDATE orders SET status = 'processing' WHERE id = $1 AND total_price = $2 AND status = 'pending_payment'",
          [order_id_num, amount]
        );
      }
    } catch (err) {
      console.error(`Lỗi cập nhật đơn hàng MoMo ${orderId}:`, err);
    }
  }
  res.status(204).send();
};
const handleVnpayWebhook = (req, res) => {
  console.log("--- VNPay Webhook Received ---", req.query);
  res.status(200).json({ RspCode: "00", Message: "success" });
};
const handleZaloPayCallback = (req, res) => {
  console.log("--- ZaloPay Callback Received ---", req.query);
  res.status(200).json({ return_code: 1, return_message: "success" });
};

// === HÀM LẤY TẤT CẢ ĐƠN HÀNG (ADMIN) (Code cũ của bạn) ===
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT o.id, o.order_code, o.total_price, o.full_name, o.created_at, o.status 
      FROM orders o 
    `;
    const queryParams = [];
    let paramIndex = 1;

    // Lọc theo Status
    if (status && status !== "Tất cả") {
      query += ` WHERE o.status = $${paramIndex++}`;
      queryParams.push(status);
    }

    // Lấy tổng số đơn (trước khi phân trang)
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS total`,
      queryParams
    );
    const totalOrders = parseInt(totalResult.rows[0].count, 10);

    // Thêm sắp xếp
    query += ` ORDER BY o.created_at DESC`;

    // Thêm phân trang
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(parseInt(limit), offset);

    // Chạy query chính
    const result = await pool.query(query, queryParams);

    res.json({
      orders: result.rows,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalOrders / parseInt(limit, 10)),
      totalOrders: totalOrders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ error: "Lỗi server." });
  }
};

// === HÀM CẬP NHẬT TRẠNG THÁI (ADMIN) (Code cũ của bạn) ===
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const allowedStatus = [
    "Chờ xác nhận",
    "Chờ lấy hàng",
    "Đang vận chuyển",
    "Hoàn thành",
    "Đã hủy",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
    "pending_recipient",
    "pending_payment",
  ];
  if (!allowedStatus.includes(status)) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ." });
  }
  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, orderId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }
    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công!",
      order: result.rows[0],
    });
  } catch (error) {
    console.error(`Lỗi khi cập nhật đơn hàng ${orderId}:`, error);
    res.status(500).json({ error: "Lỗi server." });
  }
};

// === HÀM LẤY ĐƠN HÀNG CỦA TÔI (ĐÃ SỬA LỖI SYNTAX) ===
const getUserOrders = async (req, res) => {
  const userId = req.user.id;
  const { status: tabStatus } = req.query;
  try {
    const statusMap = {
      "Tất cả": null,
      "Chờ xác nhận": "pending_payment",
      "Chờ lấy hàng": "processing",
      "Đang vận chuyển": "shipping",
      "Hoàn thành": "delivered",
      "Đã hủy": "cancelled",
      "Chờ nhận quà": "pending_recipient", // Thêm status quà
    };
    const dbStatus = statusMap[tabStatus];

    // BẮT ĐẦU SỬA LỖI: Câu query sạch, không có ký tự rác
    let query = `
      SELECT id, order_code, total_price AS total, created_at, status 
      FROM orders 
      WHERE user_id = $1
    `;
    // KẾT THÚC SỬA LỖI

    let queryParams = [userId];
    if (dbStatus) {
      query += ` AND status = $2`;
      queryParams.push(dbStatus);
    }
    query += ` ORDER BY created_at DESC`;

    const ordersResult = await pool.query(query, queryParams);

    if (ordersResult.rows.length === 0) {
      return res.json([]);
    }
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await pool.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_url, p.id AS product_id
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }
    res.json(orders);
  } catch (error) {
    console.error(
      `Lỗi khi lấy lịch sử đơn hàng cho user ID: ${userId}:`,
      error
    );
    res
      .status(500)
      .json({ error: "Lỗi server khi truy vấn lịch sử đơn hàng." });
  }
};

// === HÀM LẤY CHI TIẾT ĐƠN HÀNG (Code cũ của bạn, đã dọn dẹp) ===
const getOrderById = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { id: orderId } = req.params; // (Đổi tên route ở orderRoutes.js thành /my-orders/:id)

  try {
    let query = `
      SELECT 
        o.id, o.order_code, o.total_price AS total, o.created_at, o.status, 
        o.shipping_address, o.phone_number, o.full_name, o.payment_method, 
        o.discount_amount, o.coin_discount_amount,
        o.is_digital_gift, o.recipient_name, o.recipient_email, o.recipient_message,
        u.email AS user_email, u.full_name AS user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const queryParams = [orderId];

    // Nếu không phải Admin, chỉ cho xem đơn của mình
    if (userRole !== "admin") {
      query += ` AND o.user_id = $2`;
      queryParams.push(userId);
    }

    const orderResult = await pool.query(query, queryParams);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng." });
    }

    const order = orderResult.rows[0];

    // Lấy thông tin items
    const itemsResult = await pool.query(
      `SELECT oi.quantity, oi.price, p.name, p.image_url, p.id AS product_id
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    order.items = itemsResult.rows;

    res.json(order);
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId}:`, error);
    res.status(500).json({ error: "Lỗi server." });
  }
};

// ======================================

module.exports = {
  createOrder,
  getGiftDetailsByToken,
  claimGift,
  handleMomoWebhook,
  handleVnpayWebhook,
  handleZaloPayCallback,
  getAllOrders,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  applyVoucher,
};
