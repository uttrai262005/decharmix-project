"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import styles from "./ProfilePage.module.css";
import { FiCamera } from "react-icons/fi";
import { toast } from "react-hot-toast";
export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();

  // State cho form cập nhật thông tin
  const [formData, setFormData] = useState({
    fullName: user?.full_name || user?.name || "",
    phone: user?.phone || "",
  });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  // State cho upload avatar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return <p>Đang tải...</p>; // Layout đã xử lý, nhưng đây là fallback
  }

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Xử lý upload avatar
  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    const uploadData = new FormData();
    uploadData.append("avatar", selectedFile);

    try {
      const response = await fetch("/api/users/avatar", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload thất bại.");

      updateUser(data.user);
      toast.success("Cập nhật avatar thành công!");
      setPreview(null);
      setSelectedFile(null);
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý thay đổi thông tin trong form
  const handleInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Xử lý submit form cập nhật thông tin
  const handleInfoSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingInfo(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Cập nhật thất bại.");

      updateUser(data.user);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Thông tin tài khoản</h1>

      {/* PHẦN UPLOAD AVATAR */}
      <div className={styles.avatarSection}>
        <div
          className={styles.avatarPreviewWrapper}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image
            src={
              preview || // Ưu tiên ảnh xem trước (đã là URL hợp lệ từ URL.createObjectURL)
              (user?.avatar_url
                ? user.avatar_url.startsWith("http") // KIỂM TRA: Nếu là link tuyệt đối (Google)
                  ? user.avatar_url // Dùng trực tiếp
                  : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar_url}` // Ngược lại, ghép chuỗi (link tự upload)
                : "/default-avatar.png") // Ảnh mặc định
            }
            alt="Avatar preview"
            width={120}
            height={120}
            className={styles.avatarPreviewImage}
            key={preview || user?.avatar_url}
          />
          <div className={styles.cameraOverlay}>
            <FiCamera size={24} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />
        {preview && (
          <button
            onClick={handleAvatarUpload}
            className={styles.uploadButton}
            disabled={isUploading}
          >
            {isUploading ? "Đang tải lên..." : "Lưu ảnh đại diện"}
          </button>
        )}
      </div>

      {/* PHẦN CẬP NHẬT THÔNG TIN */}
      <form onSubmit={handleInfoSubmit} className={styles.infoForm}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className={styles.readOnlyInput}
            />
          </div>
          <div className={styles.infoItem}>
            <label htmlFor="fullName">Họ và Tên</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInfoChange}
              placeholder="Nhập họ và tên của bạn"
            />
          </div>
          <div className={styles.infoItem}>
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInfoChange}
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={isSubmittingInfo}
        >
          {isSubmittingInfo ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
