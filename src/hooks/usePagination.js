import { useState, useMemo } from 'react';

export const usePagination = (data = [], options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    showSizeChanger = true,
    pageSizeOptions = ['10', '20', '50', '100'],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, currentPageSize]);

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setCurrentPageSize(pageSize);
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setCurrentPageSize(pageSize);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const paginationConfig = {
    current: currentPage,
    pageSize: currentPageSize,
    total: totalItems,
    showSizeChanger,
    pageSizeOptions,
    onChange: handlePageChange,
    onShowSizeChange: handlePageChange,
    showTotal: (total, range) => 
      `${range[0]}-${range[1]} of ${total} items`,
  };

  return {
    currentPage,
    currentPageSize,
    totalItems,
    totalPages,
    paginatedData,
    paginationConfig,
    handlePageChange,
    resetPagination,
    nextPage,
    prevPage,
    goToPage,
    setCurrentPage,
    setCurrentPageSize,
  };
};