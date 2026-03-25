'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { addTransaction, updateTransaction } from '@/lib/firebase/firestore';
import { parseCents, centsToDecimalString } from '@/lib/utils/currency';
import { toDateInputValue } from '@/lib/utils/date';
import { CategoryChip } from '@/components/categories/CategoryChip';
import { Button } from '@/components/ui/Button';
import type { TransactionType } from '@/types';

export function AddTransactionModal() {
  const { isAddTransactionOpen, editingTransactionId, closeAddTransaction } = useUIStore();
  const { transactions, addOptimistic, updateOptimistic, removeOptimistic } = useTransactionStore();
  const categories = useCategoryStore((s) => s.categories);
  const userId = useAuthStore((s) => s.user?.id);
  const toast = useToast();

  const editingTx = editingTransactionId
    ? transactions.find((t) => t.id === editingTransactionId)
    : null;

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);

  // Populate form when editing
  useEffect(() => {
    if (editingTx) {
      setType(editingTx.type);
      setAmountStr(centsToDecimalString(editingTx.amount));
      setCategoryId(editingTx.categoryId);
      setDate(toDateInputValue(editingTx.date));
      setNote(editingTx.note ?? '');
    } else {
      setType('expense');
      setAmountStr('');
      setCategoryId(categories[0]?.id ?? '');
      setDate(toDateInputValue(new Date()));
      setNote('');
    }
  }, [editingTx, isAddTransactionOpen, categories]);

  // Auto-focus amount when opened
  useEffect(() => {
    if (isAddTransactionOpen) {
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, [isAddTransactionOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isAddTransactionOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAddTransaction();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isAddTransactionOpen, closeAddTransaction]);

  // Filter categories by type
  const expenseCategories = categories.filter((c) => !['Salary'].includes(c.name));
  const incomeCategories  = categories.filter((c) => ['Salary', 'Other'].includes(c.name) || !['Food','Transport','Shopping','Health','Bills','Entertainment','Education'].includes(c.name));
  const displayCategories = type === 'income' ? incomeCategories : expenseCategories;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const amount = parseCents(amountStr);
    if (amount <= 0 || !categoryId) return;

    setIsSubmitting(true);

    const txData = {
      userId,
      type,
      amount,
      categoryId,
      date: new Date(date + 'T12:00:00'),
      note: note.trim() || undefined,
    };

    closeAddTransaction();

    if (editingTx) {
      // Optimistic update
      updateOptimistic(editingTx.id, txData);
      try {
        await updateTransaction(editingTx.id, txData);
        toast.success('Transaction updated');
      } catch {
        updateOptimistic(editingTx.id, editingTx); // revert
        toast.error('Failed to update transaction');
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      addOptimistic({ id: tempId, createdAt: new Date(), ...txData });
      try {
        const realId = await addTransaction(txData);
        updateOptimistic(tempId, { id: realId });
        toast.success('Transaction added');
      } catch {
        removeOptimistic(tempId);
        toast.error('Failed to save transaction');
      }
    }

    setIsSubmitting(false);
  }

  const content = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-150 capitalize ${
              type === t
                ? t === 'expense'
                  ? 'bg-[var(--color-expense)] text-white'
                  : 'bg-[var(--color-income)] text-white'
                : 'bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            {t === 'expense' ? '💸 Expense' : '💰 Income'}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="flex flex-col items-center gap-1">
        <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Amount</label>
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--color-muted)]">$</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="0.00"
            required
            className="w-full text-center text-3xl font-bold font-[var(--font-mono)] text-[var(--color-heading)] bg-[var(--color-surface-muted)] rounded-xl py-4 pl-10 pr-4 border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
          />
        </div>
      </div>

      {/* Category chips */}
      <div>
        <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide mb-2 block">Category</label>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {displayCategories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              selected={categoryId === cat.id}
              onClick={() => setCategoryId(cat.id)}
            />
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-heading)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
        />
      </div>

      {/* Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--color-muted)] uppercase tracking-wide">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Dinner with friends"
          className="w-full rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)]"
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full mt-1">
        {editingTx ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </form>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <AnimatePresence>
        {isAddTransactionOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddTransaction}
            />
            <motion.div
              className="fixed bottom-0 inset-x-0 z-50 bg-[var(--color-surface)] rounded-t-[var(--radius-modal)] md:hidden"
              style={{ maxHeight: '90vh' }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.velocity.y > 400 || info.offset.y > 200) closeAddTransaction();
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[var(--color-border)]" />
              </div>
              <div className="px-5 pb-8 pt-3 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 24px)' }}>
                <h2 className="text-base font-bold text-[var(--color-heading)] mb-4">
                  {editingTx ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: centered modal */}
      <AnimatePresence>
        {isAddTransactionOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm hidden md:flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) closeAddTransaction(); }}
            >
              <motion.div
                className="bg-[var(--color-surface)] rounded-[var(--radius-modal)] w-full max-w-md mx-4 p-6 overflow-y-auto"
                style={{ boxShadow: 'var(--shadow-modal)', maxHeight: '90vh' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-[var(--color-heading)]">
                    {editingTx ? 'Edit Transaction' : 'Add Transaction'}
                  </h2>
                  <button
                    onClick={closeAddTransaction}
                    className="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-heading)] transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {content}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
