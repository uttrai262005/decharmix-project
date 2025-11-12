"use client";

import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus } from "react-icons/fi";
import StarRating from "./StarRating"; // Import component StarRating

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number;
  image_url: string[] | null;
  average_rating: number; // Thêm
  review_count: number; // Thêm
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl =
    product.image_url && product.image_url.length > 0
      ? product.image_url[0]
      : "/placeholder.png";

  const hasDiscount =
    product.discount_price &&
    Number(product.discount_price) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.price) - Number(product.discount_price)) /
          Number(product.price)) *
          100
      )
    : 0;

  return (
    <div className="group relative flex w-full max-w-xs flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-2">
      <Link
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl"
        href={`/products/${product.id}`}
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {hasDiscount && (
          <span className="absolute top-0 left-0 m-2 rounded-full bg-green-600 px-2 text-center text-sm font-medium text-white">
            {discountPercent}% OFF
          </span>
        )}
      </Link>
      <div className="mt-4 px-5 pb-5">
        <Link href={`/products/${product.id}`}>
          <h5 className="text-xl tracking-tight text-slate-900 truncate">
            {product.name}
          </h5>
        </Link>
        <div className="mt-2 mb-4 flex items-center justify-between">
          <p>
            {hasDiscount ? (
              <>
                <span className="text-2xl font-bold text-green-600">
                  {Number(product.discount_price).toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-slate-900 line-through ml-2">
                  {Number(product.price).toLocaleString("vi-VN")} ₫
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-slate-900">
                {Number(product.price).toLocaleString("vi-VN")} ₫
              </span>
            )}
          </p>
        </div>
        {/* === THÊM PHẦN RATING VÀO ĐÂY === */}
        <div className="flex items-center">
          <StarRating rating={product.average_rating} />
          <span className="ml-2 mr-2 rounded bg-yellow-200 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
            {Number(product.average_rating).toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">
            ({product.review_count} đánh giá)
          </span>
        </div>
        <button className="mt-4 flex w-full items-center justify-center rounded-md bg-green-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
