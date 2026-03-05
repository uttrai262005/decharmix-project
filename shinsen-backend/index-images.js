const tf = require("@tensorflow/tfjs");
const mobilenet = require("@tensorflow-models/mobilenet");
const { Pool } = require("pg");
const axios = require("axios");
require("dotenv").config();
const jpeg = require("jpeg-js");
const { PNG } = require("pngjs");

// 1. KẾT NỐI CSDL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

let model;

// 2. HÀM TẢI ẢNH (loadImage) - (Giữ nguyên)
async function loadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data, "binary");
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
      throw new Error(
        "Không nhận dạng được định dạng ảnh (chỉ hỗ trợ JPG/PNG)."
      );
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
      `  [Lỗi] Không thể tải/đọc ảnh (JS): ${imageUrl}`,
      error.message
    );
    return null;
  }
}

// 3. HÀM LẤY VECTOR (getVector) - (Giữ nguyên)
async function getVector(imageTensor) {
  try {
    const vector = model.infer(imageTensor, true).arraySync()[0];
    return vector;
  } catch (error) {
    console.error("  [Lỗi] AI không thể suy luận:", error.message);
    return null;
  }
}

// 4. HÀM CHÍNH (Main Function)
async function indexAllProducts() {
  console.log("🤖 Bắt đầu quá trình huấn luyện AI (Nâng cấp pgvector)...");

  console.log("Tải mô hình AI (MobileNet)...");
  model = await mobilenet.load();
  console.log("✅ Tải mô hình thành công!");

  console.log("Đang lấy danh sách sản phẩm từ CSDL...");
  const { rows: products } = await pool.query(
    // (Chúng ta chạy lại cho TẤT CẢ sản phẩm)
    "SELECT id, name, image_url FROM products"
  );
  console.log(
    `🔎 Tìm thấy ${products.length} sản phẩm cần "dạy" AI (pgvector).`
  );

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageUrl =
      product.image_url && product.image_url[0] ? product.image_url[0] : null;

    console.log(`\n(${i + 1}/${products.length}) Đang xử lý: ${product.name}`);

    if (!imageUrl) {
      console.log("  [Bỏ qua] Sản phẩm không có hình ảnh.");
      continue;
    }

    console.log(`  Đang tải ảnh: ${imageUrl.substring(0, 50)}...`);
    const imageTensor = await loadImage(imageUrl);
    if (!imageTensor) continue;

    console.log('  AI đang "nhìn" ảnh (bằng JS)...');
    const vector = await getVector(imageTensor);
    if (!vector) continue;

    console.log("  Đang lưu 'vector' (pgvector) vào CSDL...");

    // === SỬA LỖI DUY NHẤT Ở ĐÂY ===
    // (Kiểu VECTOR(1024) nhận vào 1 chuỗi JSON, không phải mảng REAL)
    await pool.query(
      "UPDATE products SET image_vector = $1 WHERE id = $2",
      [JSON.stringify(vector), product.id] // (Chuyển mảng [0.1,..] thành chuỗi '[0.1,...]')
    );
    // ============================

    console.log("  ✅ Đã lưu!");

    tf.dispose(imageTensor);
  }

  console.log("\n🎉🎉🎉 HOÀN TẤT! AI đã nhận diện xong (pgvector).");
}

// 5. CHẠY HÀM CHÍNH
indexAllProducts()
  .catch(console.error)
  .finally(() => pool.end());
