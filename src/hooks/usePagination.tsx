import { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
  maxPageButtons?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  paginatedItems: any[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextPage: number;
  previousPage: number;
  pageNumbers: number[];
}

export function usePagination<T>(
  items: T[],
  options: PaginationOptions = {}
): UsePaginationReturn {
  const {
    itemsPerPage = 10,
    initialPage = 1,
    maxPageButtons = 5,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const canGoNext = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

  const canGoPrevious = useMemo(() => currentPage > 1, [currentPage, totalPages]);

  const nextPage = useMemo(() => Math.min(currentPage + 1, totalPages), [currentPage, totalPages]);

  const previousPage = useMemo(() => Math.max(currentPage - 1, 1), [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const showAll = totalPages <= maxPageButtons;
    const pages = number[] = [];

    if (showAll) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxPageButtons / 2);
      const startPage = Math.max(1, currentPage - half);
      const endPage = Math.min(totalPages, currentPage + half);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (totalPages - pages[pages.length - 1] > endPage) {
        pages.push(totalPages);
      }
    }

    if (!pages.includes(currentPage)) {
      pages.push(currentPage);
    }

    return pages.sort((a, b) => a - b);
  }, [totalPages, currentPage, maxPageButtons]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages, setCurrentPage]);

  const goToNextPage = useCallback(() => {
    goToPage(nextPage);
  }, [goToPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    goToPage(previousPage);
  }, [goToPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    canGoNext,
    canGoPrevious,
    nextPage,
    previousPage,
    pageNumbers,
  };
}
