'use client';
import { create } from 'zustand';
import type { Transaction, TransactionFilters } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  filters: TransactionFilters;
  setTransactions: (transactions: Transaction[]) => void;
  addOptimistic: (transaction: Transaction) => void;
  updateOptimistic: (id: string, data: Partial<Transaction>) => void;
  removeOptimistic: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  type: 'all',
  categoryId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: true,
  filters: DEFAULT_FILTERS,

  setTransactions: (transactions) => set({ transactions, isLoading: false }),

  addOptimistic: (transaction) =>
    set((s) => ({ transactions: [transaction, ...s.transactions] })),

  updateOptimistic: (id, data) =>
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  removeOptimistic: (id) =>
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
