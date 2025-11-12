"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "@/styles/AdminPage.module.css";
import formStyles from "@/styles/AdminForm.module.css";
import tableStyles from "@/styles/AdminTable.module.css";

import {
  FiArrowLeft,
  FiSave,
  FiImage,
  FiTag,
  FiDollarSign,
  FiArchive,
} from "react-icons/fi";
import toast from "react-hot-toast";

// (Interface Product giữ nguyên)
interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number | null;
  description: string;
  category: string;
  stock_quantity: number;
  image_url: string[] | null;
  tags: string[] | null;
}

export default function AdminProductEditPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const isNew = productId === "new";

  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    discount_price: null,
    description: "",
    category: "VÒNG TAY",
    stock_quantity: 0,
    image_url: [],
    tags: [],
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tải dữ liệu (Giữ nguyên logic)
  useEffect(() => {
    if (isNew) return;
    if (!token || !productId) return;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        const data: Product = await res.json();
        setProduct({
          ...data,
          image_url: data.image_url || [],
          tags: data.tags || [],
        });
      } catch (error) {
        console.error(error);
        toast.error("Tải sản phẩm thất bại");
        router.push("/manage-products"); // <-- SỬA LINK KHI LỖI
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [token, productId, isNew, router]);

  // (Các hàm handleChange, handleTagChange, handleImageChange giữ nguyên)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsArray = e.target.value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0);
    setProduct((prev) => ({ ...prev, tags: tagsArray }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const imagesArray = e.target.value
      .split("\n")
      .map((img) => img.trim())
      .filter((img) => img.length > 0);
    setProduct((prev) => ({ ...prev, image_url: imagesArray }));
  };

  // 5. Hàm LƯU SẢN PHẨM (Giữ nguyên logic)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);

    const endpoint = isNew ? "/api/products" : `/api/products/${productId}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      const updatedProduct = await res.json();
      if (!res.ok) throw new Error(updatedProduct.error || "Lưu thất bại");

      toast.success("Lưu sản phẩm thành công!");
      router.push("/manage-products"); // <-- SỬA LINK KHI THÀNH CÔNG
    } catch (error: any) {
      console.error(error);
      toast.error(`Lưu thất bại: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className={styles.pageTitle}>Đang tải...</div>;
  }

  return (
    <div>
      {/* === SỬA DÒNG NÀY === */}
      <Link href="/manage-products" className={styles.backButton}>
        <FiArrowLeft /> Quay lại danh sách
      </Link>
      {/* =================== */}

      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          {isNew ? "Tạo Sản Phẩm Mới" : "Chỉnh sửa Sản Phẩm"}
        </h1>
        <button
          onClick={handleSubmit}
          className={tableStyles.createButton}
          disabled={isSaving}
        >
          <FiSave /> {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </div>

      {/* FORM (Toàn bộ phần form bên dưới giữ nguyên) */}
      <form onSubmit={handleSubmit} className={formStyles.formLayout}>
        {/* Cột trái */}
        <div className={formStyles.leftColumn}>
          <div className={formStyles.card}>
            {/* ... (Input Tên, Mô tả) ... */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="name">Tên sản phẩm</label>
              <input
                id="name"
                name="name"
                type="text"
                value={product.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={formStyles.inputGroup}>
              <label htmlFor="description">Mô tả sản phẩm</label>
              <textarea
                id="description"
                name="description"
                rows={8}
                value={product.description}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={formStyles.card}>
            {/* ... (Input Hình ảnh) ... */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="image_url">
                Danh sách Link Hình ảnh (Mỗi link 1 dòng)
              </label>
              <textarea
                id="image_url"
                name="image_url"
                rows={5}
                value={product.image_url?.join("\n")}
                onChange={handleImageChange}
                placeholder="https..."
              />
              <p className={formStyles.helpText}>
                Ảnh đầu tiên sẽ là ảnh đại diện (thumbnail).
              </p>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className={formStyles.rightColumn}>
          <div className={formStyles.card}>
            {/* ... (Input Giá) ... */}
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="price">Giá gốc</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={product.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="discount_price">
                  Giá khuyến mãi (Bỏ trống nếu không giảm)
                </label>
                <input
                  id="discount_price"
                  name="discount_price"
                  type="number"
                  value={product.discount_price || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className={formStyles.card}>
            {/* ... (Input Kho hàng, Danh mục) ... */}
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                >
                  <option value="VÒNG TAY">Vòng Tay</option>
                  <option value="DÂY CHUYỀN">Dây Chuyền</option>
                  <option value="PHỤ KIỆN TÓC">Phụ Kiện Tóc</option>
                  <option value="COMBO QUÀ TẶNG">Combo Quà Tặng</option>
                  <option value="CHƯA PHÂN LOẠI">Chưa phân loại</option>
                </select>
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="stock_quantity">Số lượng tồn kho</label>
                <input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={product.stock_quantity}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className={formStyles.card}>
            {/* ... (Input Tags) ... */}
            <div className={formStyles.inputGroup}>
              <label htmlFor="tags">
                Các tags (Phân cách bằng dấu phẩy ",")
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={product.tags?.join(", ")}
                onChange={handleTagChange}
                placeholder="menh-hoa, cute..."
              />
              <p className={formStyles.helpText}>
                Dùng để Trợ lý Ảo tìm sản phẩm.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
