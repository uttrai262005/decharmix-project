/**
 * ProductRepository
 * -----------------
 * Repository layer trừu tượng hóa truy vấn dữ liệu sản phẩm.
 * Hiện tại sử dụng lại logic truy vấn từ module Product.
 */

const pool = require("../config/db");

class ProductRepository {
  async findByVector(vector, limit = 10) {
    return [];
  }

  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    return rows[0];
  }
}

module.exports = ProductRepository;
