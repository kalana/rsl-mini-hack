'use client';
import { create } from 'zustand';
import type { Toast } from '@/types';

interface UIState {
  isAddTransactionOpen: boolean;
  editingTransactionId: string | null;
  toasts: Toast[];
  openAddTransaction: () => void;
  closeAddTransaction: () => void;
  setEditingTransaction: (id: string | null) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionOpen: false,
  editingTransactionId: null,
  toasts: [],

  openAddTransaction: () => set({ isAddTransactionOpen: true }),
  closeAddTransaction: () =>
    set({ isAddTransactionOpen: false, editingTransactionId: null }),

  setEditingTransaction: (id) =>
    set({ editingTransactionId: id, isAddTransactionOpen: id !== null }),

  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
