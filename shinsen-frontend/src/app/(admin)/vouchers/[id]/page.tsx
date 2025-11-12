"use client";

import tableStyles from "@/styles/AdminTable.module.css";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Giả sử bạn có hook này
import Link from "next/link";
import styles from "@/styles/AdminPage.module.css";
import formStyles from "@/styles/AdminForm.module.css";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

// Định nghĩa kiểu
interface Voucher {
  id?: number;
  code: string;
  description: string;
  type: "fixed" | "percent" | "shipping" | string;
  value: number;
  min_order_value: number;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  quantity: number;
  is_active: boolean;
}

// Hàm format ngày (YYYY-MM-DDTHH:mm:ss) sang (YYYY-MM-DD)
const formatDateForInput = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Chuyển sang múi giờ địa phương trước khi lấy YYYY-MM-DD
    // để tránh lỗi bị lùi 1 ngày
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export default function VoucherEditPage() {
  const { token } = useAuth(); // Giả sử bạn có hook này
  const router = useRouter();
  const params = useParams();

  // Logic quan trọng: Lấy id từ params
  // Khi vào /vouchers/new -> params.id là "new"
  // Khi vào /vouchers/123 -> params.id là "123"
  // 1. Lấy id, chấp nhận nó có thể là undefined
  const id = params.id as string | undefined;

  // 2. Sửa logic: "isNew" đúng KHI id là "new" HOẶC id là undefined
  const isNew = id === "new" || id === undefined;

  const [voucher, setVoucher] = useState<Partial<Voucher>>({
    code: "",
    description: "",
    type: "fixed",
    value: 10000,
    min_order_value: 0,
    max_discount: null,
    start_date: formatDateForInput(new Date().toISOString()),
    end_date: "",
    quantity: 100,
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(!isNew); // Chỉ load khi là "edit"
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tải Voucher (nếu là Sửa)
  useEffect(() => {
    // Nếu là trang "Tạo mới" (isNew) thì không cần fetch
    if (isNew || !token) return;

    const fetchVoucher = async () => {
      setIsLoading(true); // Bắt đầu loading
      try {
        const res = await fetch(`/api/vouchers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không tìm thấy voucher");
        const data: Voucher = await res.json();

        // Format lại ngày tháng cho input type="date"
        setVoucher({
          ...data,
          start_date: formatDateForInput(data.start_date),
          end_date: formatDateForInput(data.end_date),
        });
      } catch (error: any) {
        toast.error(error.message);
        router.push("/vouchers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVoucher();
  }, [token, id, isNew, router]);

  // 2. Hàm xử lý thay đổi (ĐÃ SỬA LỖI INPUT SỐ)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      // Xử lý checkbox
      const { checked } = e.target as HTMLInputElement;
      setVoucher((prev) => ({ ...prev, [name]: checked }));
    } else {
      // Xử lý các input khác
      let finalValue: string | number | null = value;

      // *** PHẦN SỬA LỖI QUAN TRỌNG ***
      // Kiểm tra nếu là input số
      if (
        type === "number" &&
        (name === "value" ||
          name === "min_order_value" ||
          name === "max_discount" ||
          name === "quantity")
      ) {
        if (value === "") {
          // Nếu ô số bị xóa rỗng
          if (name === "max_discount") {
            finalValue = null; // max_discount có thể null
          } else {
            finalValue = 0; // các ô số khác mặc định là 0 nếu rỗng
          }
        } else {
          // Chuyển string (ví dụ "50000") thành number (50000)
          finalValue = parseFloat(value);
        }
      }

      setVoucher((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  // 3. Hàm Lưu (POST hoặc PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    // Endpoint và Method được quyết định bởi cờ `isNew`
    const endpoint = isNew ? "/api/vouchers" : `/api/vouchers/${id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(voucher),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lưu thất bại");

      toast.success(isNew ? "Tạo voucher thành công!" : "Cập nhật thành công!");
      router.push("/vouchers"); // Quay về trang danh sách
      router.refresh(); // Yêu cầu router làm mới data (quan trọng)
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Hiển thị loading chỉ khi ở chế độ "Sửa"
  if (isLoading) {
    return <div className={styles.pageTitle}>Đang tải...</div>;
  }

  // Giao diện Form
  return (
    <div>
      <Link href="/vouchers" className={styles.backButton}>
        <FiArrowLeft /> Quay lại danh sách
      </Link>

      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          {isNew ? "Tạo Voucher Mới" : `Sửa Voucher: ${voucher.code}`}
        </h1>
        <button
          onClick={handleSubmit}
          className={tableStyles.createButton}
          disabled={isSaving}
        >
          <FiSave /> {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.formLayout}>
        {/* Cột trái */}
        <div className={formStyles.leftColumn}>
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>Thông tin cơ bản</h3>
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="code">Mã Code (VD: CODE10K)</label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={voucher.code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="type">Loại Voucher</label>
                <select
                  id="type"
                  name="type"
                  value={voucher.type}
                  onChange={handleChange}
                >
                  <option value="fixed">Giảm tiền (Fixed)</option>
                  <option value="percent">Giảm phần trăm (%)</option>
                  <option value="shipping">Miễn Ship</option>
                </select>
              </div>
            </div>
            <div className={formStyles.inputGroup}>
              <label htmlFor="description">Mô tả (Cho Admin & User xem)</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={voucher.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className={formStyles.rightColumn}>
          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>Giá trị & Điều kiện</h3>
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="value">Giá trị (Xu hoặc %)</label>
                <input
                  id="value"
                  name="value"
                  type="number"
                  value={voucher.value}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="min_order_value">Đơn tối thiểu (đ)</label>
                <input
                  id="min_order_value"
                  name="min_order_value"
                  type="number"
                  value={voucher.min_order_value}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            {voucher.type === "percent" && (
              <div className={formStyles.inputGroup}>
                <label htmlFor="max_discount">
                  Giảm tối đa (đ) (Bỏ trống nếu không giới hạn)
                </label>
                <input
                  id="max_discount"
                  name="max_discount"
                  type="number"
                  value={voucher.max_discount || ""} // Hiển thị rỗng nếu là null
                  onChange={handleChange}
                  min="0"
                />
              </div>
            )}
          </div>

          <div className={formStyles.card}>
            <h3 className={formStyles.cardTitle}>Thời hạn & Số lượng</h3>
            <div className={formStyles.grid2Cols}>
              <div className={formStyles.inputGroup}>
                <label htmlFor="start_date">Ngày bắt đầu</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={voucher.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={formStyles.inputGroup}>
                <label htmlFor="end_date">Ngày kết thúc</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={voucher.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={formStyles.inputGroup}>
              <label htmlFor="quantity">Tổng số lượt (Quantity)</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={voucher.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div
              className={formStyles.inputGroup}
              style={{ marginTop: "1rem" }}
            >
              <label className={formStyles.checkboxLabel}>
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={voucher.is_active}
                  onChange={handleChange}
                />
                Kích hoạt (Cho phép sử dụng)
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
