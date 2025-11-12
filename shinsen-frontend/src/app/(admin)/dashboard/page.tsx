"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import styles from "@/styles/AdminPage.module.css";
import kpiStyles from "@/styles/AdminKpi.module.css"; // (CSS ở bước B)
import todoStyles from "@/styles/AdminTodo.module.css"; // (CSS ở bước B)
import {
  FiDollarSign,
  FiShoppingBag,
  FiGift,
  FiUsers,
  FiArchive,
  FiAlertTriangle,
} from "react-icons/fi";
import Link from "next/link";

// Định nghĩa kiểu dữ liệu
interface Stats {
  totalRevenue: number;
  newOrders: number;
  newGifts: number;
  totalUsers: number;
}
interface OrderTodo {
  id: number;
  order_code: string;
  full_name: string;
  total_price: number;
}
interface StockTodo {
  id: number;
  name: string;
  stock_quantity: number;
}
interface Todo {
  ordersToProcess: OrderTodo[];
  lowStockProducts: StockTodo[];
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, todoRes] = await Promise.all([
          fetch("/api/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/admin/todo", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (todoRes.ok) {
          setTodo(await todoRes.json());
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* 1. HÀNG KPI */}
      <div className={kpiStyles.kpiGrid}>
        <div className={kpiStyles.kpiCard}>
          <FiDollarSign
            className={kpiStyles.icon}
            style={{ color: "#22c55e" }}
          />
          <div className={kpiStyles.text}>
            <span className={kpiStyles.label}>Doanh thu (24h)</span>
            <span className={kpiStyles.value}>
              {isLoading
                ? "..."
                : `${stats?.totalRevenue.toLocaleString("vi-VN")} ₫`}
            </span>
          </div>
        </div>
        <div className={kpiStyles.kpiCard}>
          <FiShoppingBag
            className={kpiStyles.icon}
            style={{ color: "#3b82f6" }}
          />
          <div className={kpiStyles.text}>
            <span className={kpiStyles.label}>Đơn hàng mới</span>
            <span className={kpiStyles.value}>
              {isLoading ? "..." : stats?.newOrders}
            </span>
          </div>
        </div>
        <div className={kpiStyles.kpiCard}>
          <FiGift className={kpiStyles.icon} style={{ color: "#ec4899" }} />
          <div className={kpiStyles.text}>
            <span className={kpiStyles.label}>Quà chờ nhận</span>
            <span className={kpiStyles.value}>
              {isLoading ? "..." : stats?.newGifts}
            </span>
          </div>
        </div>
        <div className={kpiStyles.kpiCard}>
          <FiUsers className={kpiStyles.icon} style={{ color: "#f97316" }} />
          <div className={kpiStyles.text}>
            <span className={kpiStyles.label}>Khách hàng</span>
            <span className={kpiStyles.value}>
              {isLoading ? "..." : stats?.totalUsers}
            </span>
          </div>
        </div>
      </div>

      {/* 2. HÀNG "VIỆC CẦN LÀM" */}
      <div className={todoStyles.todoGrid}>
        {/* CỘT ĐƠN HÀNG */}
        <div className={todoStyles.todoList}>
          <h3 className={todoStyles.title}>
            <FiArchive /> Đơn hàng cần xử lý
          </h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : todo?.ordersToProcess.length === 0 ? (
            <p>Không có đơn hàng nào.</p>
          ) : (
            todo?.ordersToProcess.map((order) => (
              <Link
                href={`/orders/${order.id}`}
                key={order.id}
                className={todoStyles.todoItem}
              >
                <div className={todoStyles.itemMain}>
                  <span className={todoStyles.code}>{order.order_code}</span>
                  <span className={todoStyles.name}>{order.full_name}</span>
                </div>
                <span className={todoStyles.price}>
                  {order.total_price.toLocaleString("vi-VN")} ₫
                </span>
              </Link>
            ))
          )}
        </div>

        {/* CỘT KHO HÀNG */}
        <div className={todoStyles.todoList}>
          <h3 className={todoStyles.title}>
            <FiAlertTriangle /> Sản phẩm sắp hết
          </h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : todo?.lowStockProducts.length === 0 ? (
            <p>Kho hàng đầy đủ.</p>
          ) : (
            todo?.lowStockProducts.map((product) => (
              <Link
                href={`/products/${product.id}`}
                key={product.id}
                className={todoStyles.todoItem}
              >
                <div className={todoStyles.itemMain}>
                  <span className={todoStyles.name}>{product.name}</span>
                </div>
                <span className={todoStyles.stock}>
                  Còn {product.stock_quantity}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
