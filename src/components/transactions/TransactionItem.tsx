'use client';
import { useState } from 'react';
import { CategoryBadge } from '@/components/categories/CategoryBadge';
import { formatCurrency } from '@/lib/utils/currency';
import { formatRelativeDate } from '@/lib/utils/date';
import type { Transaction, Category } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  currency?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction: t, category, currency = 'USD', onEdit, onDelete }: TransactionItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-3 py-3 relative">
      <CategoryBadge category={category} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-heading)] truncate">
          {category?.name ?? 'Unknown'}
        </p>
        <p className="text-xs text-[var(--color-muted)] truncate">
          {t.note ? `${t.note} · ` : ''}{formatRelativeDate(t.date)}
        </p>
      </div>
      <span className={`text-sm font-semibold font-[var(--font-mono)] flex-shrink-0 ${t.type === 'income' ? 'text-[var(--color-income)]' : 'text-[var(--color-expense)]'}`}>
        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
      </span>

      {/* Action menu button */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => { setShowMenu(!showMenu); setConfirmDelete(false); }}
          className="w-7 h-7 rounded-full hover:bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-body)] transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => { setShowMenu(false); setConfirmDelete(false); }} />
            <div className="absolute right-0 top-8 z-20 bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-modal)] border border-[var(--color-border)] py-1 min-w-[130px] overflow-hidden">
              {!confirmDelete ? (
                <>
                  <button
                    onClick={() => { onEdit(t.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--color-body)] hover:bg-[var(--color-surface-muted)] flex items-center gap-2"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full text-left px-3 py-2 text-sm text-[var(--color-expense)] hover:bg-[var(--color-expense-bg)] flex items-center gap-2"
                  >
                    🗑️ Delete
                  </button>
                </>
              ) : (
                <div className="px-3 py-2">
                  <p className="text-xs text-[var(--color-body)] mb-2">Delete this transaction?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onDelete(t.id); setShowMenu(false); }}
                      className="flex-1 py-1 rounded-lg bg-[var(--color-expense)] text-white text-xs font-semibold"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-body)] text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
