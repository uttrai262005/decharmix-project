const pool = require("../config/db");

// @desc    Lấy tất cả sản phẩm (ĐÃ SỬA LỖI - Đã thêm filter, limit, search, category)
const getProducts = async (req, res) => {
  try {
    // === SỬA 1: Thêm 'tag', 'page', 'limit' (với giá trị mặc định) ===
    const { category, filter, limit = 999, page = 1, search, tag } = req.query;

    let queryParams = []; // Chứa các giá trị cho SQL
    let query = `
      SELECT 
        p.*, 
        p.id as product_id, -- Đảm bảo luôn có product_id
        COALESCE(avg_reviews.avg_rating, 0) AS average_rating, 
        COALESCE(avg_reviews.review_count, 0) AS review_count
      FROM 
        products p
      LEFT JOIN (
        SELECT 
          product_id, 
          AVG(rating)::FLOAT AS avg_rating, 
          COUNT(id) AS review_count 
        FROM 
          reviews 
        GROUP BY 
          product_id
      ) AS avg_reviews ON p.id = avg_reviews.product_id
    `;

    // === Xây dựng mệnh đề WHERE (Đã sửa lỗi) ===
    let whereClauses = []; // Mệnh đề (VD: p.category = $1)
    let countParams = []; // Giá trị cho WHERE (VD: 'VÒNG TAY')
    let paramIndex = 1;

    if (category) {
      whereClauses.push(`p.category = $${paramIndex++}`);
      countParams.push(category);
    }

    // === SỬA LỖI 2: CHỈ THÊM 'search' KHI NÓ TỒN TẠI ===
    if (search) {
      whereClauses.push(`p.name ILIKE $${paramIndex++}`);
      countParams.push(`%${search}%`);
    }

    // === SỬA LỖI 3: CHỈ THÊM 'tag' KHI NÓ TỒN TẠI ===
    if (tag) {
      whereClauses.push(`p.tags @> ARRAY[$${paramIndex++}]::text[]`);
      countParams.push(tag);
    }
    // ===================================================

    // Nối mệnh đề WHERE vào cả 2 query
    let whereString = "";
    if (whereClauses.length > 0) {
      whereString = ` WHERE ${whereClauses.join(" AND ")}`;
      query += whereString;
    }

    // Lấy tổng sản phẩm (ĐỂ PHÂN TRANG)
    let countQuery = `SELECT COUNT(*) FROM products p ${whereString}`;
    const totalResult = await pool.query(countQuery, countParams);
    const totalProducts = parseInt(totalResult.rows[0].count, 10);

    // Thêm ORDER BY (cho filter)
    if (filter === "new") {
      query += ` ORDER BY p.id DESC`;
    } else if (filter === "bestseller") {
      query += ` ORDER BY COALESCE(avg_reviews.review_count, 0) DESC, COALESCE(avg_reviews.avg_rating, 0) DESC`;
    } else {
      query += ` ORDER BY p.id ASC`;
    }

    // Thêm LIMIT và OFFSET (cho pagination)
    const offset = (page - 1) * limit;
    // queryParams bây giờ là [params của WHERE] + [limit] + [offset]
    queryParams = [...countParams, parseInt(limit), offset];

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    query += `;`; // Kết thúc câu lệnh

    // Chạy câu lệnh SQL chính
    const allProducts = await pool.query(query, queryParams);

    // Giữ nguyên logic format của bạn
    const formattedProducts = allProducts.rows.map((product) => {
      const safeParseFloat = (value) => {
        if (value === null || value === undefined) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };
      return {
        ...product,
        price: safeParseFloat(product.price),
        discount_price: safeParseFloat(product.discount_price),
        stock_quantity: parseInt(product.stock_quantity || 0, 10),
        average_rating: safeParseFloat(product.average_rating),
        review_count: parseInt(product.review_count || 0, 10),
        image_url: Array.isArray(product.image_url) ? product.image_url : [],
      };
    });

    // Trả về đúng cấu trúc { products: [...] }
    res.json({
      products: formattedProducts,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalProducts / parseInt(limit, 10)),
      totalProducts: totalProducts,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error.message);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// --- HÀM LẤY SẢN PHẨM THEO ID (Giữ nguyên) ---
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        p.*, 
        COALESCE(avg_reviews.avg_rating, 0) AS average_rating, 
        COALESCE(avg_reviews.review_count, 0) AS review_count
      FROM 
        products p
      LEFT JOIN (
        SELECT 
          product_id, 
          AVG(rating)::FLOAT AS avg_rating, 
          COUNT(id) AS review_count 
        FROM 
          reviews 
        GROUP BY 
          product_id
      ) AS avg_reviews ON p.id = avg_reviews.product_id
      WHERE p.id = $1;
    `;
    const product = await pool.query(query, [id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    res.json(product.rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error.message);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// --- HÀM TÌM KIẾM SẢN PHẨM (Giữ nguyên cho Header) ---
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const query = `
      SELECT id, name, image_url
      FROM products
      WHERE name ILIKE $1
      ORDER BY name ASC
      LIMIT 10; -- (Thêm limit 10 cho ô tìm kiếm)
    `;
    const { rows } = await pool.query(query, [`%${q}%`]);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error.message);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};

// === THÊM CÁC HÀM MỚI CHO TRANG CHỦ ===

// @desc    Lấy Deal Hot
// (Bạn cần thêm cột is_deal (boolean) và deal_end_date (timestamp) vào bảng 'products')
const getDealOfTheDay = async (req, res) => {
  try {
    const query = `
      SELECT * FROM products 
      WHERE is_deal = true AND deal_end_date > NOW()
      LIMIT 1;
    `;
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      // Fallback: Nếu không có deal, lấy 1 sản phẩm giảm giá
      const fallbackQuery = `
        SELECT * FROM products 
        WHERE discount_price IS NOT NULL AND discount_price > 0
        LIMIT 1;
      `;
      const fallbackResult = await pool.query(fallbackQuery);
      if (fallbackResult.rows.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm deal" });
      }
      return res.json(fallbackResult.rows[0]);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy deal hot:", error.message);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
};
const getGiftBoxAssets = async (req, res) => {
  try {
    const categories = [
      "VÒNG TAY",
      "DÂY CHUYỀN",
      "PHỤ KIỆN TÓC",
      "PHỤ KIỆN GÓI QUÀ", // (Hộp, nơ, thiệp...)
    ];

    const { rows } = await pool.query(
      "SELECT id AS product_id, name, price, discount_price, image_url, category FROM products WHERE category = ANY($1)",
      [categories]
    );
    // Phân loại sản phẩm về 4 mảng
    const assets = {
      vongTay: rows.filter((p) => p.category === "VÒNG TAY"),
      dayChuyen: rows.filter((p) => p.category === "DÂY CHUYỀN"),
      phuKienToc: rows.filter((p) => p.category === "PHỤ KIỆN TÓC"),
      phuKienGoiQua: rows.filter((p) => p.category === "PHỤ KIỆN GÓI QUÀ"),
    };

    res.json(assets);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm Xưởng Gói Quà:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};
const createProduct = async (req, res) => {
  // Mặc định tạo 1 sản phẩm trống
  const {
    name = "Sản phẩm mới",
    price = 0,
    category = "CHƯA PHÂN LOẠI",
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (name, price, category, stock_quantity) 
       VALUES ($1, $2, $3, 0) 
       RETURNING *`,
      [name, price, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Cập nhật sản phẩm (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    discount_price,
    description,
    category,
    stock_quantity,
    image_url,
    tags,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products 
       SET 
         name = $1, 
         price = $2, 
         discount_price = $3, 
         description = $4, 
         category = $5, 
         stock_quantity = $6, 
         image_url = $7, 
         tags = $8
       WHERE id = $9 
       RETURNING *`,
      [
        name,
        price,
        discount_price || null,
        description,
        category,
        stock_quantity,
        image_url,
        tags,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// @desc    Xóa sản phẩm (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // (Lưu ý: Bạn nên kiểm tra xem sản phẩm có trong đơn hàng nào không trước khi xóa)
    // (Tạm thời chúng ta sẽ xóa trực tiếp)
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error.message);
    res
      .status(500)
      .json({ error: "Lỗi server (Có thể sản phẩm dính khóa ngoại)" });
  }
};
module.exports = {
  getProducts,
  getProductById,
  searchProducts,
  getDealOfTheDay,
  getGiftBoxAssets,
  createProduct,
  updateProduct,
  deleteProduct,
};
