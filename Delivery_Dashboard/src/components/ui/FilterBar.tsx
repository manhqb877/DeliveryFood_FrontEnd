import React from 'react';
import { Search, RefreshCw, LayoutGrid, List } from 'lucide-react';

export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterDropdown {
  id: string;
  label: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (val: string) => void;
}

export interface QuickChip {
  id: string;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  dropdowns?: FilterDropdown[];
  chips?: QuickChip[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onRefresh?: () => void;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  dropdowns = [],
  chips = [],
  viewMode,
  onViewModeChange,
  onRefresh,
  primaryAction,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col gap-3">
      {/* Top row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search bar */}
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* Dropdowns */}
          {dropdowns.map((dd) => (
            <div key={dd.id} className="flex items-center gap-1.5">
              <select
                value={dd.value}
                onChange={(e) => dd.onChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors text-slate-700 font-medium"
              >
                {dd.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg bg-white transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* View toggle */}
          {onViewModeChange && viewMode && (
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-800 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Xem dạng Lưới (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-1 rounded cursor-pointer transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-800 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Xem dạng Danh sách (List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Primary Action Button (Dark Navy) */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-1.5 bg-[#0F2540] hover:bg-[#1E3A5F] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Chips row */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Lọc nhanh:</span>
          {chips.map((chip) => (
            <button
              key={chip.id}
              onClick={chip.onClick}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${
                chip.active
                  ? 'bg-[#0F2540] text-white border-[#0F2540] font-medium'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {chip.label} {chip.count !== undefined ? `(${chip.count})` : ''}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
