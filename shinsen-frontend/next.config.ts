import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Các tùy chọn cấu hình khác của bạn */
  images: {
    remotePatterns: [
      // Cho phép ảnh từ localhost (để hiển thị avatar)
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/avatars/**",
      },
      // Cho phép ảnh từ nanghandmade.com
      {
        protocol: "https",
        hostname: "nanghandmade.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      // Cho phép ảnh từ meomeocharm.com
      {
        protocol: "https",
        hostname: "meomeocharm.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },

      // === CÁC LINK CÒN THIẾU ĐÃ ĐƯỢC THÊM ===
      {
        protocol: "https",
        hostname: "pos.nvncdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "decharmix.id.vn",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "", // Không cần port
        pathname: "/**", // Cho phép bất kỳ đường dẫn nào sau hostname
      },
    ],
  },

  // Giữ lại cấu hình rewrites cho API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
