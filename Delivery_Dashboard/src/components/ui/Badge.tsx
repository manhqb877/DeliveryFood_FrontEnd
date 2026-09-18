import React from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'yellow' | 'blue' | 'green' | 'red' | 'grey';

interface BadgeProps {
  variant?: BadgeVariant;
  statusText?: string;
  children?: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export function Badge({ variant, statusText, children, showDot = true, className }: BadgeProps) {
  // Infer variant from status string if variant not explicitly provided
  let inferredVariant: BadgeVariant = variant || 'grey';
  if (!variant && statusText) {
    const s = statusText.toUpperCase();
    if (['PENDING', 'PLACED', 'OPEN', 'SCHEDULING'].includes(s)) inferredVariant = 'yellow';
    else if (['CONFIRMED', 'PREPARING', 'IN_REVIEW', 'ASSIGNED', 'DELIVERING', 'MATCHING', 'INVESTIGATING', 'PEAK_HOUR'].includes(s)) inferredVariant = 'blue';
    else if (['ACTIVE', 'APPROVED', 'AVAILABLE', 'READY_FOR_PICKUP', 'DELIVERED', 'COMPLETED', 'SUCCESS', 'CONFIRMED_COD', 'PAID'].includes(s)) inferredVariant = 'green';
    else if (['REJECTED', 'CANCELLED', 'LOCKED', 'SOLD_OUT', 'FAILED', 'CRITICAL', 'SUSPENDED', 'DISPUTED'].includes(s)) inferredVariant = 'red';
    else if (['HIDDEN', 'DISCONTINUED', 'CLOSED', 'DRAFT', 'OFF_PEAK'].includes(s)) inferredVariant = 'grey';
  }

  const styles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    red: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
    grey: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
  };

  const current = styles[inferredVariant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full', current.dot)} />}
      {children || statusText}
    </span>
  );
}
