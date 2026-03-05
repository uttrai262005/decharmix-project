/**
 * AIServiceAdapter
 * ----------------
 * Adapter kết nối hệ thống AI bên ngoài (Python / TensorFlow).
 * File này phục vụ thiết kế kiến trúc và mở rộng trong tương lai.
 */

class AIServiceAdapter {
  constructor() {
    this.provider = "MobileNet";
  }

  async extractFeatureVector(imagePath) {
    return [];
  }
}

module.exports = AIServiceAdapter;
