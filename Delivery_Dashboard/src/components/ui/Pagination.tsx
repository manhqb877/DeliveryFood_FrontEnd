import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          // Show first, last, current, and +/- 1 from current
          const isVisible = 
            page === 1 || 
            page === totalPages || 
            Math.abs(page - currentPage) <= 1;
            
          if (!isVisible) {
            // Show ellipsis only if it's the gap between 1 and current-1, or current+1 and total
            if (page === 2 && currentPage > 3) {
                return <span key={page} className="px-1 text-slate-400 text-xs">...</span>;
            }
            if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return <span key={page} className="px-1 text-slate-400 text-xs">...</span>;
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-600'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
