const pool = require("../config/db");

exports.getTraceabilityInfo = async (req, res) => {
  const { batchCode } = req.params;

  try {
    // Lấy thông tin lô hàng và nhà cung cấp
    const batchInfo = await pool.query(
      `SELECT 
                b.batch_code, 
                b.manufacturing_date, 
                b.expiry_date, 
                s.name as supplier_name,
                s.address as supplier_address
             FROM batches b 
             JOIN suppliers s ON b.supplier_id = s.id 
             WHERE b.batch_code = $1`,
      [batchCode]
    );

    if (batchInfo.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy thông tin cho mã lô hàng này." });
    }

    // Lấy danh sách các sản phẩm thuộc lô hàng này
    const productsInBatch = await pool.query(
      `SELECT p.name 
             FROM products p 
             JOIN product_batches pb ON p.id = pb.product_id 
             JOIN batches b ON pb.batch_id = b.id
             WHERE b.batch_code = $1`,
      [batchCode]
    );

    res.json({
      batch: batchInfo.rows[0],
      products: productsInBatch.rows,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin truy vết:", error);
    res.status(500).json({ error: "Server error" });
  }
};
