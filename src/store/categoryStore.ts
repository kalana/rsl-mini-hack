'use client';
import { create } from 'zustand';
import type { Category } from '@/types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  addOptimistic: (category: Category) => void;
  updateOptimistic: (id: string, data: Partial<Category>) => void;
  removeOptimistic: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: true,

  setCategories: (categories) => set({ categories, isLoading: false }),
  addOptimistic: (category) =>
    set((s) => ({ categories: [...s.categories, category] })),
  updateOptimistic: (id, data) =>
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  removeOptimistic: (id) =>
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}));
