"use client";

import { useState, useEffect } from "react";

// Component Cánh hoa Anh Đào
const SakuraPetal = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute text-pink-300 text-2xl"
    style={{
      ...style,
      animation: `fall ${Math.random() * 8 + 7}s linear infinite`,
    }}
  >
    🌸
  </div>
);

// Component Bông tuyết
const Snowflake = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute rounded-full bg-white opacity-80"
    style={{
      ...style,
      animation: `snowfall ${Math.random() * 10 + 5}s linear infinite`,
    }}
  />
);

// Component Sao băng
const ShootingStar = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute top-0 right-0 h-0.5 bg-gradient-to-l from-white to-transparent"
    style={{
      ...style,
      filter: "drop-shadow(0 0 6px white)",
      animation: `shootingStar ${Math.random() * 3 + 2}s ease-in-out infinite`,
    }}
  />
);

// Chỉ export default component chính
export default function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const numSakura = 8;
  const numSnowflakes = 50;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Hiệu ứng Hoa Anh Đào */}
      {Array.from({ length: numSakura }).map((_, i) => (
        <SakuraPetal
          key={`sakura-${i}`}
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Hiệu ứng Tuyết rơi */}
      {Array.from({ length: numSnowflakes }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <Snowflake
            key={`snow-${i}`}
            style={{
              left: `${Math.random() * 100}vw`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        );
      })}

      {/* Hiệu ứng Sao băng */}
      <ShootingStar
        style={{
          top: "20%",
          right: "-100px",
          width: "150px",
          animationDelay: "1s",
        }}
      />
      <ShootingStar
        style={{
          top: "50%",
          right: "-100px",
          width: "200px",
          animationDelay: "5s",
        }}
      />
      <ShootingStar
        style={{
          top: "80%",
          right: "-100px",
          width: "120px",
          animationDelay: "8s",
        }}
      />
    </div>
  );
}
