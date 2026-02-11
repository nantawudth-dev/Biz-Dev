
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems <= 6) { // Don't show pagination if total items is less than the smallest page size
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex items-center gap-4">
        <div className="relative">
            <label htmlFor="items-per-page-select" className="sr-only">แสดงผลต่อหน้า</label>
            <select
                id="items-per-page-select"
                value={itemsPerPage}
                onChange={onItemsPerPageChange}
                className="pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none text-sm font-body text-slate-600"
            >
                <option value={6}>6 / หน้า</option>
                <option value={12}>12 / หน้า</option>
                <option value={18}>18 / หน้า</option>
                <option value={totalItems}>ทั้งหมด</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        { totalPages > 1 && (
            <p className="text-sm text-slate-600 font-body hidden sm:block">
              แสดง <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> จาก <span className="font-semibold text-slate-800">{totalItems}</span>
            </p>
        )}
      </div>

      { totalPages > 1 && (
          <nav className="flex items-center gap-2" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              ก่อนหน้า
            </button>
    
            <div className="hidden md:flex items-center gap-1">
              {pageNumbers.map(number => (
                <button
                  key={number}
                  onClick={() => onPageChange(number)}
                  className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
                    currentPage === number
                      ? 'bg-blue-600 border-blue-600 text-white z-10'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {number}
                </button>
              ))}
            </div>
    
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </nav>
      )}
    </div>
  );
};

export default Pagination;
