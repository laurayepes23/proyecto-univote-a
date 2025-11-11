// Simple reusable pagination helper
// Returns an array of page numbers to display based on current, total and max visible pages
export function getPageNumbers(currentPage, totalPages, maxVisiblePages = 5) {
  const pages = [];
  if (!totalPages || totalPages < 1) return pages;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
}

// Optional small hook to manage pagination state
import { useState, useMemo } from 'react';
export function usePagination(initialPage = 1, initialPerPage = 6, totalItems = 0) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);
  const totalPages = useMemo(() => Math.ceil((totalItems || 0) / itemsPerPage) || 1, [itemsPerPage, totalItems]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    pages: getPageNumbers(currentPage, totalPages),
    goToPage: (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages)),
    next: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prev: () => setCurrentPage((p) => Math.max(p - 1, 1)),
  };
}