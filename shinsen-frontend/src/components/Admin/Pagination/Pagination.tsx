"use client";

import styles from "@/styles/AdminPagination.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
} from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Hàm tạo dải trang (ví dụ: [1, '...', 4, 5, 6, '...', 10])
const getPaginationRange = (
  current: number,
  total: number,
  siblings = 1
): (string | number)[] => {
  const totalPageNumbers = siblings * 2 + 5; // 1(first) + 1(last) + 1(current) + 2*siblings + 2('...')

  if (totalPageNumbers >= total) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(current - siblings, 1);
  const rightSiblingIndex = Math.min(current + siblings, total);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < total - 1;

  const firstPageIndex = 1;
  const lastPageIndex = total;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblings;
    let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, "...", total];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblings;
    let rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => total - rightItemCount + i + 1
    );
    return [firstPageIndex, "...", ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
  }

  return []; // Trường hợp mặc định
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null; // Không hiển thị nếu chỉ có 1 trang
  }

  const paginationRange = getPaginationRange(currentPage, totalPages);

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <nav className={styles.paginationNav}>
      <button
        className={`${styles.pageItem} ${
          currentPage === 1 ? styles.disabled : ""
        }`}
        onClick={onPrevious}
        disabled={currentPage === 1}
      >
        <FiChevronLeft />
      </button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === "...") {
          return (
            <span key={index} className={`${styles.pageItem} ${styles.dots}`}>
              <FiMoreHorizontal />
            </span>
          );
        }

        return (
          <button
            key={index}
            className={`${styles.pageItem} ${
              pageNumber === currentPage ? styles.active : ""
            }`}
            onClick={() => onPageChange(pageNumber as number)}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        className={`${styles.pageItem} ${
          currentPage === totalPages ? styles.disabled : ""
        }`}
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}
