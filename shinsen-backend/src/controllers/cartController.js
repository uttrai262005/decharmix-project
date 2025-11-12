const pool = require("../config/db");

// Hàm trợ giúp: Lấy cart_id của user, nếu chưa có thì tạo mới
const getOrCreateCart = async (userId) => {
  let cart = await pool.query("SELECT id FROM carts WHERE user_id = $1", [
    userId,
  ]);
  if (cart.rows.length === 0) {
    cart = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
      [userId]
    );
  }
  return cart.rows[0].id;
};

// @desc    Lấy tất cả sản phẩm trong giỏ hàng
const getCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const cartId = await getOrCreateCart(userId); // Giả sử bạn có hàm này

    const query = `
      SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.discount_price,
        (p.image_url[1]) AS image_url 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY p.name;
    `;
    const { rows } = await pool.query(query, [cartId]);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Thêm sản phẩm vào giỏ hàng
const addItemToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;
  const quantityToAdd = parseInt(quantity, 10);

  if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
    return res.status(400).json({ error: "Số lượng không hợp lệ." });
  }

  try {
    const cartId = await getOrCreateCart(userId);
    const existingItem = await pool.query(
      "SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );

    if (existingItem.rows.length > 0) {
      const existingQuantity = parseInt(existingItem.rows[0].quantity, 10);
      const updatedQuantity = existingQuantity + quantityToAdd;
      const { rows } = await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *",
        [updatedQuantity, cartId, productId]
      );
      return res.json(rows[0]);
    } else {
      const { rows } = await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [cartId, productId, quantityToAdd]
      );
      return res.json(rows[0]);
    }
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật số lượng sản phẩm
const updateCartItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;
  const newQuantity = parseInt(quantity, 10);

  if (isNaN(newQuantity) || newQuantity < 0) {
    return res.status(400).json({ error: "Số lượng không hợp lệ." });
  }

  try {
    const cartId = await getOrCreateCart(userId);
    if (newQuantity === 0) {
      return removeCartItem(req, res);
    }
    const { rows } = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *",
      [newQuantity, cartId, parseInt(productId, 10)]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm trong giỏ." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  try {
    const cartId = await getOrCreateCart(userId);
    const result = await pool.query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, parseInt(productId, 10)]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sản phẩm trong giỏ." });
    }
    res.status(200).json({ message: "Xóa sản phẩm thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
};
