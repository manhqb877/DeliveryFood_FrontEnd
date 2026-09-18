import React from 'react';
import { Badge } from './Badge';

interface CardGridItemProps {
  image?: string;
  categoryOverlay?: string;
  statusText?: string;
  subBadge?: string;
  title: string;
  subtitle?: string;
  metaItems?: Array<{ icon: React.ReactNode; label: string }>;
  detailAction?: { label?: string; onClick: () => void };
  actions?: Array<{ icon: React.ReactNode; title: string; onClick: () => void; danger?: boolean }>;
  className?: string;
}

export function CardGridItem({
  image,
  categoryOverlay,
  statusText,
  subBadge,
  title,
  subtitle,
  metaItems,
  detailAction,
  actions,
  className = '',
}: CardGridItemProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow ${className}`}>
      {/* Thumbnail area */}
      {image && (
        <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {categoryOverlay && (
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
              {categoryOverlay}
            </div>
          )}
          {statusText && (
            <div className="absolute top-3 right-3 shadow-xs">
              <Badge statusText={statusText} />
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {subBadge && (
            <span className="inline-block text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mb-1.5">
              {subBadge}
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-800 line-clamp-1">{title}</h3>
          {subtitle && (
            <p className="text-xs italic text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>
          )}

          {/* Meta row */}
          {metaItems && metaItems.length > 0 && (
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
              {metaItems.map((meta, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="text-slate-400">{meta.icon}</span>
                  <span>{meta.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action footer */}
        {(detailAction || (actions && actions.length > 0)) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {detailAction ? (
              <button
                onClick={detailAction.onClick}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {detailAction.label || 'Chi tiết →'}
              </button>
            ) : <div />}

            {actions && actions.length > 0 && (
              <div className="flex items-center gap-1.5">
                {actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={act.onClick}
                    title={act.title}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      act.danger
                        ? 'text-rose-600 hover:bg-rose-50'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {act.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
