"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/AdminPage.module.css";
import tableStyles from "@/styles/AdminTable.module.css";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import Pagination from "@/components/Admin/Pagination/Pagination";

// Định nghĩa kiểu
interface Product {
  id: number;
  product_id: number;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  image_url: string[] | null;
}
interface ProductResponse {
  products: Product[];
  totalPages: number;
  currentPage: number;
}

export default function AdminProductsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Hàm tải sản phẩm (theo trang) - Giữ nguyên
  const fetchProducts = async (page: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không thể tải sản phẩm");

      const data: ProductResponse = await res.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Tải sản phẩm thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Tải lần đầu - Giữ nguyên
  useEffect(() => {
    fetchProducts(currentPage);
  }, [token, currentPage]);

  // 3. Hàm Xóa sản phẩm - Giữ nguyên
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xóa thất bại");
      toast.success("Xóa sản phẩm thành công!");
      fetchProducts(currentPage);
    } catch (error: any) {
      toast.error(`Xóa thất bại: ${error.message}`);
    }
  };

  // 4. Hàm Tạo sản phẩm mới
  const handleCreateProduct = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: "Sản phẩm mới (Bản nháp)" }),
      });

      const newProduct: Product = await res.json();
      if (!res.ok) throw new Error("Tạo sản phẩm thất bại");

      toast.success("Tạo sản phẩm mới thành công!");

      // === SỬA 1: Sửa link thành '/manage-products' ===
      // (Lưu ý: Chúng ta dùng 'newProduct.id' vì [productId] sẽ nhận nó)
      router.push(`/manage-products/${newProduct.id}`);
    } catch (error: any) {
      toast.error(`Tạo thất bại: ${error.message}`);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Quản lý Sản phẩm</h1>
        <button
          onClick={handleCreateProduct}
          className={tableStyles.createButton}
        >
          <FiPlus /> Tạo sản phẩm mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Đang tải...</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td data-label="Hình ảnh">
                    <Image
                      src={
                        (product.image_url && product.image_url[0]) ||
                        "/placeholder.png"
                      }
                      alt={product.name}
                      width={50}
                      height={50}
                      className={tableStyles.productImage}
                    />
                  </td>
                  <td data-label="Tên sản phẩm" className={tableStyles.name}>
                    {product.name}
                  </td>
                  <td data-label="Danh mục">{product.category}</td>
                  <td data-label="Giá" className={tableStyles.price}>
                    {Number(product.price).toLocaleString("vi-VN")} ₫
                  </td>
                  <td data-label="Kho hàng">
                    <span
                      className={
                        product.stock_quantity <= 5
                          ? tableStyles.stockLow
                          : tableStyles.stockOk
                      }
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td data-label="Hành động">
                    <div className={tableStyles.actionGroup}>
                      {/* Link đến trang sản phẩm (Khách xem) */}
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className={tableStyles.actionButtonView}
                      >
                        <FiEye />
                      </Link>

                      {/* === SỬA 2: Sửa link thành '/manage-products' === */}
                      <Link
                        href={`/manage-products/${product.id}`}
                        className={tableStyles.actionButtonEdit}
                      >
                        <FiEdit />
                      </Link>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={tableStyles.actionButtonDelete}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={6}>Không tìm thấy sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
