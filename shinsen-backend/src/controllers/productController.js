const pool = require("../config/db");
const tf = require("@tensorflow/tfjs");
const mobilenet = require("@tensorflow-models/mobilenet");
const fs = require("fs");
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

// @desc    Lấy tất cả sản phẩm ()
const getProducts = async (req, res) => {
  try {
    const { category, filter, limit = 999, page = 1, search, tag } = req.query;

    let queryParams = [];
    let query = `
      SELECT 
        p.*, 
        p.sentiment_summary,
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
        p.sentiment_summary,
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
      [categories],
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
      [name, price, category],
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
      ],
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
      [id],
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

const getAlsoBoughtProducts = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      WITH orders_with_product AS (
        -- 1. Tìm đơn hàng chứa sản phẩm A
        SELECT order_id 
        FROM order_items 
        WHERE product_id = $1
      ),
      also_bought_products AS (
        -- 2. Lấy các sản phẩm khác cũng trong đơn hàng đó
        SELECT product_id AS also_bought_product_id
        FROM order_items
        WHERE order_id IN (SELECT order_id FROM orders_with_product)
          AND product_id != $1
      ),
      top_bought AS (
         -- 3. Đếm và xếp hạng
        SELECT 
          also_bought_product_id, 
          COUNT(*) AS purchase_count
        FROM also_bought_products
        GROUP BY also_bought_product_id
        ORDER BY purchase_count DESC
        LIMIT 5
      )
      -- 4. Lấy thông tin sản phẩm
      SELECT 
        p.*, 
        tb.purchase_count
      FROM products p
      JOIN top_bought tb ON p.id = tb.also_bought_product_id
      ORDER BY tb.purchase_count DESC;
    `;

    const { rows } = await pool.query(query, [id]);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm mua cùng:", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};
let model;

// === CÁC HÀM HELPER CHO AI ===

// HÀM 1: HÀM TẢI ẢNH (Bằng JS, từ file tạm)
async function loadImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    let pixelData;
    let width, height;

    if (
      buffer[0] === 137 &&
      buffer[1] === 80 &&
      buffer[2] === 78 &&
      buffer[3] === 71
    ) {
      const pngData = PNG.sync.read(buffer);
      pixelData = pngData.data;
      width = pngData.width;
      height = pngData.height;
    } else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) {
      const jpegData = jpeg.decode(buffer, { useTArray: true });
      pixelData = jpegData.data;
      width = jpegData.width;
      height = jpegData.height;
    } else {
      throw new Error("Không nhận dạng được định dạng ảnh.");
    }

    const numPixels = width * height;
    const channels = 3;
    const rgbData = new Uint8Array(numPixels * channels);
    for (let i = 0; i < numPixels; i++) {
      rgbData[i * channels] = pixelData[i * 4]; // R
      rgbData[i * channels + 1] = pixelData[i * 4 + 1]; // G
      rgbData[i * channels + 2] = pixelData[i * 4 + 2]; // B
    }
    const tensor = tf.tensor3d(rgbData, [height, width, 3], "int32");
    return tensor.resizeNearestNeighbor([224, 224]).toFloat().expandDims();
  } catch (error) {
    console.error(
      `[Lỗi] Không thể đọc file ảnh (JS): ${filePath}`,
      error.message,
    );
    return null;
  }
}

// HÀM 2: HÀM LẤY VECTOR (AI "nhìn" ảnh)
async function getVector(imageTensor) {
  try {
    // 2. XÓA LOGIC TẢI AI Ở ĐÂY
    const vector = model.infer(imageTensor, true).arraySync()[0];
    return vector;
  } catch (error) {
    console.error(
      "  [Lỗi] AI không thể suy luận (hoặc model chưa được tải):",
      error.message,
    );
    return null;
  }
}

// HÀM 3: HÀM KHỞI ĐỘNG AI (MỚI)
const initMobileNetModel = async () => {
  if (model) return;
  try {
    console.log("🤖 Đang tải mô hình AI (MobileNet) vào bộ nhớ...");
    model = await mobilenet.load();
    console.log("✅ Tải mô hình AI (MobileNet) thành công!");
  } catch (error) {
    console.error("--- LỖI NGHIÊM TRỌNG: KHÔNG THỂ TẢI MÔ HÌNH AI ---", error);
  }
};

// HÀM 4: API VISUAL SEARCH
const visualSearch = async (req, res) => {
  try {
    if (!model) {
      return res
        .status(503)
        .json({ error: "AI đang khởi động, vui lòng thử lại sau 10 giây." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Không tìm thấy file ảnh." });
    }
    const filePath = req.file.path;

    // 1.  user upload
    const imageTensor = await loadImage(filePath);
    if (!imageTensor) {
      return res.status(400).json({ error: "Không thể đọc file ảnh." });
    }
    const userVector = await getVector(imageTensor);
    tf.dispose(imageTensor);

    // 2. Dùng SQL
    const userVectorString = JSON.stringify(userVector);
    const query = `
      SELECT 
        id, name, image_url, price, discount_price, category,
        (image_vector <=> $1) AS similarity_distance
      FROM products
      WHERE image_vector IS NOT NULL
      ORDER BY similarity_distance ASC 
      LIMIT 6;
    `;
    const { rows: products } = await pool.query(query, [userVectorString]);

    // 3. Chuyển đổi kết quả
    const results = products.map((p) => ({
      similarity: 1 - p.similarity_distance,
      product: {
        id: p.id,
        name: p.name,
        image_url: p.image_url,
        price: p.price,
        discount_price: p.discount_price,
        category: p.category,
      },
    }));

    // 4. Xóa file ảnh tạm
    fs.unlinkSync(filePath);
    res.json(results);
  } catch (error) {
    console.error("Lỗi Visual Search API (pgvector):", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};
const getForYouRecommendations = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Lấy "Vector" của user
    const { rows } = await pool.query(
      "SELECT taste_vector FROM users WHERE id = $1",
      [userId],
    );

    const userVectorString = rows[0]?.taste_vector;

    // Nếu user chưa có, trả về sản phẩm mới nhất
    if (!userVectorString) {
      const { rows: newProducts } = await pool.query(
        "SELECT * FROM products ORDER BY created_at DESC LIMIT 10",
      );
      return res.json(newProducts);
    }

    // 2. Dùng pgvector để tìm sản phẩm GẦN NHẤT với taste vector
    const query = `
      SELECT 
        id, name, image_url, price, discount_price, category,
        (image_vector <=> $1) AS similarity
      FROM products
      WHERE image_vector IS NOT NULL
      ORDER BY similarity ASC 
      LIMIT 10;
    `;
    const { rows: products } = await pool.query(query, [userVectorString]);

    res.json(products);
  } catch (error) {
    console.error("Lỗi API 'For You':", error.message);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const getRelatedProducts = async (req, res) => {
  const { id } = req.params;

  try {
    // BƯỚC 1: Lấy vector của sản phẩm hiện tại
    const productRes = await pool.query(
      "SELECT image_vector, category FROM products WHERE id = $1",
      [id],
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { image_vector, category } = productRes.rows[0];

    // BƯỚC 2: Kiểm tra xem sản phẩm có vector chưa
    if (!image_vector) {
      const fallbackQuery = `
        SELECT * FROM products 
        WHERE id != $1 AND category = $2 
        LIMIT 5
      `;
      const fallbackRes = await pool.query(fallbackQuery, [id, category]);
      return res.json(fallbackRes.rows);
    }

    const query = `
      SELECT 
        id, name, image_url, price, discount_price, category,
        (image_vector <=> $2) as distance -- Tính khoảng cách Cosine
      FROM products
      WHERE id != $1 AND image_vector IS NOT NULL
      ORDER BY distance ASC -- Khoảng cách càng nhỏ => Độ giống (Similarity) càng cao
      LIMIT 5;
    `;

    const relatedRes = await pool.query(query, [id, image_vector]);

    res.json(relatedRes.rows);
  } catch (error) {
    console.error("Lỗi Related Products AI:", error.message);
    res.status(500).json({ error: "Server Error" });
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
  getRelatedProducts,
  getAlsoBoughtProducts,
  visualSearch,
  initMobileNetModel,
  getForYouRecommendations,
};
