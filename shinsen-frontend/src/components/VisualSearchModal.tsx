"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiX, FiSearch, FiAlertTriangle } from "react-icons/fi";
import styles from "./VisualSearchModal.module.css";
import { toast } from "react-hot-toast";

// Lấy API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Interface (Giản lược) ---
interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number;
  image_url: string[] | null;
  category: string;
}
interface SearchResult {
  product: Product;
  similarity: number; // (Độ giống nhau)
}

// --- Component Card (Hiển thị kết quả) ---
const SearchResultCard = ({ result }: { result: SearchResult }) => {
  const { product, similarity } = result;
  const displayPrice = product.discount_price || product.price;
  const firstImage =
    (product.image_url && product.image_url[0]) || "/placeholder.png";

  return (
    <Link href={`/products/${product.id}`} className={styles.resultCard}>
      <div className={styles.resultImageWrapper}>
        <Image
          src={firstImage}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="20vw"
        />
        <span className={styles.similarityBadge}>
          Giống: {Math.round(similarity * 100)}%
        </span>
      </div>
      <div className={styles.resultContent}>
        <p className={styles.resultCategory}>{product.category}</p>
        <h4 className={styles.resultName}>{product.name}</h4>
        <p className={styles.resultPrice}>
          {Number(displayPrice).toLocaleString("vi-VN")} ₫
        </p>
      </div>
    </Link>
  );
};

// --- Component Modal Chính ---
export default function VisualSearchModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Xử lý khi kéo/thả file
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults([]); // Xóa kết quả cũ
      setError(null); // Xóa lỗi cũ
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    multiple: false,
  });

  // 2. Xử lý khi bấm nút "Tìm kiếm"
  const handleSearch = async () => {
    if (!file || !API_URL) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("image", file); // ("image" phải khớp với tên middleware)

    try {
      // 3. Gọi API AI
      const res = await fetch(`${API_URL}/api/products/visual-search`, {
        method: "POST",
        body: formData,
        // (Không cần 'Content-Type', trình duyệt tự thêm)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tìm kiếm thất bại.");
      }

      setResults(data);
      if (data.length === 0) {
        setError("Không tìm thấy sản phẩm nào đủ giống.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Xử lý xóa ảnh
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>
        <h2 className={styles.title}>Tìm kiếm bằng Hình ảnh (AI)</h2>

        {/* === PHẦN UPLOAD === */}
        {!preview && (
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${
              isDragActive ? styles.dropzoneActive : ""
            }`}
          >
            <input {...getInputProps()} />
            <FiUploadCloud className={styles.uploadIcon} />
            <p>Kéo thả ảnh của bạn vào đây</p>
            <p className={styles.dropzoneOr}>hoặc</p>
            <p className={styles.browseButton}>Chọn file từ máy tính</p>
            <p className={styles.fileHint}>(Hỗ trợ *.jpg, *.png)</p>
          </div>
        )}

        {/* === PHẦN XEM TRƯỚC & NÚT BẤM === */}
        {preview && (
          <div className={styles.previewContainer}>
            <Image
              src={preview}
              alt="Ảnh xem trước"
              fill
              style={{ objectFit: "contain" }}
            />
            <button
              className={styles.removeImageButton}
              onClick={handleRemoveImage}
            >
              <FiX />
            </button>
          </div>
        )}

        {file && (
          <button
            className={styles.searchButton}
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loader}></span> // (Loader CSS)
            ) : (
              <>
                <FiSearch />
                {isLoading ? "Đang phân tích AI..." : "Tìm kiếm sản phẩm"}
              </>
            )}
          </button>
        )}

        {/* === PHẦN KẾT QUẢ === */}
        <div className={styles.resultsContainer}>
          {error && (
            <div className={styles.errorBox}>
              <FiAlertTriangle /> {error}
            </div>
          )}

          {results.length > 0 && (
            <>
              <h3 className={styles.resultsTitle}>Kết quả phù hợp nhất</h3>
              <div className={styles.resultsGrid}>
                {results.map((result) => (
                  <SearchResultCard key={result.product.id} result={result} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
