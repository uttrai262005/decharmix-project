"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "@/styles/AdminPage.module.css";
import tableStyles from "@/styles/AdminTable.module.css";
import { FiEdit, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import Pagination from "@/components/Admin/Pagination/Pagination"; // <-- 1. IMPORT

interface Customer {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}
interface CustomerResponse {
  customers: Customer[];
  totalPages: number;
  currentPage: number;
}

export default function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải danh sách
  useEffect(() => {
    if (!token) return;

    const fetchCustomers = async (page: number, search: string) => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/customers?page=${page}&search=${search}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Không thể tải danh sách");

        const data: CustomerResponse = await res.json();
        setCustomers(data.customers);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      // 2. SỬA: Khi tìm kiếm, quay về trang 1
      fetchCustomers(searchTerm ? 1 : currentPage, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [token, currentPage, searchTerm]);

  // 3. Hàm xử lý khi gõ tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi gõ
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Khách hàng</h1>

      {/* Thanh Tìm kiếm */}
      <div className={tableStyles.toolbar}>
        <div className={tableStyles.searchInput}>
          <FiSearch />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={handleSearchChange} // <-- 4. SỬA HÀM
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Khách hàng</th>
              <th>Email</th>
              <th>Ngày tham gia</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>Đang tải...</td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td data-label="ID">{customer.id}</td>
                  <td data-label="Tên" className={tableStyles.name}>
                    {customer.full_name}
                  </td>
                  <td data-label="Email">{customer.email}</td>
                  <td data-label="Ngày tham gia">
                    {new Date(customer.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td data-label="Hành động">
                    <Link
                      href={`/customers/${customer.id}`}
                      className={tableStyles.actionButtonEdit}
                    >
                      <FiEdit /> Sửa
                    </Link>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && customers.length === 0 && (
              <tr>
                <td colSpan={5}>Không tìm thấy khách hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. THÊM COMPONENT PHÂN TRANG */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
