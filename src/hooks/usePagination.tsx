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

  const canGoNext = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const canGoPrevious = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const nextPage = useMemo(() => {
    return Math.min(currentPage + 1, totalPages);
  }, [currentPage, totalPages]);

  const previousPage = useMemo(() => {
    return Math.max(currentPage - 1, 1);
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const showAll = totalPages <= maxPageButtons;
    const half = Math.floor(maxPageButtons / 2);
    const startPage = Math.max(1, currentPage - half);
    const endPage = Math.min(totalPages, currentPage + half);
    const pages: number[] = [];

    if (showAll) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages.sort((a, b) => a - b);
  }, [totalPages, currentPage, maxPageButtons]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    goToPage(nextPage);
  }, [goToPage, nextPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(previousPage);
  }, [goToPage, previousPage]);

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
