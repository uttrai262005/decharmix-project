import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // ĐÃ SỬA: Cho phép ảnh avatar từ máy chủ Render
      {
        protocol: "https",
        hostname: "shinsen-backend-api.onrender.com",
        port: "",
        pathname: "/uploads/avatars/**",
      },
      {
        protocol: "https",
        hostname: "nanghandmade.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "meomeocharm.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
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
        port: "",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // ĐÃ SỬA: Trỏ API thẳng về máy chủ Render
        destination: "https://shinsen-backend-api.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
