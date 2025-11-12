const pool = require("../config/db");

// @desc    Lấy các số liệu KPI cho Dashboard
// @route   GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    // 1. Doanh thu 24h qua (chỉ đơn đã hoàn thành hoặc đang xử lý)
    const revenueRes = await pool.query(
      `SELECT SUM(total_price) AS total_revenue
       FROM orders 
       WHERE created_at > NOW() - INTERVAL '1 day'
       AND (status = 'processing' OR status = 'delivered' OR status = 'pending_recipient')`
    );

    // 2. Đơn hàng mới (chờ xử lý)
    const newOrdersRes = await pool.query(
      "SELECT COUNT(id) AS new_orders FROM orders WHERE status = 'processing'"
    );

    // 3. Quà tặng mới (chờ người nhận)
    const newGiftsRes = await pool.query(
      "SELECT COUNT(id) AS new_gifts FROM orders WHERE status = 'pending_recipient'"
    );

    // 4. Tổng số khách hàng
    const usersRes = await pool.query(
      "SELECT COUNT(id) AS total_users FROM users WHERE role = 'user'"
    );

    res.json({
      totalRevenue: revenueRes.rows[0].total_revenue || 0,
      newOrders: newOrdersRes.rows[0].new_orders || 0,
      newGifts: newGiftsRes.rows[0].new_gifts || 0,
      totalUsers: usersRes.rows[0].total_users || 0,
    });
  } catch (error) {
    console.error("Lỗi khi lấy số liệu admin:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Lấy danh sách "Việc cần làm"
// @route   GET /api/admin/todo
const getDashboardTodo = async (req, res) => {
  try {
    // 1. 5 đơn hàng cần xử lý
    const ordersTodo = await pool.query(
      `SELECT id, order_code, full_name, total_price 
       FROM orders 
       WHERE status = 'processing' 
       ORDER BY created_at ASC 
       LIMIT 5`
    );

    // 2. 5 sản phẩm sắp hết hàng (<= 5 sản phẩm)
    const stockTodo = await pool.query(
      `SELECT id, name, stock_quantity 
       FROM products 
       WHERE stock_quantity <= 5 
       ORDER BY stock_quantity ASC 
       LIMIT 5`
    );

    res.json({
      ordersToProcess: ordersTodo.rows,
      lowStockProducts: stockTodo.rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách todo admin:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardTodo,
};
