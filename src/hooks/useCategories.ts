'use client';
import { useEffect } from 'react';
import { subscribeToCategories } from '@/lib/firebase/firestore';
import { useCategoryStore } from '@/store/categoryStore';
import { useAuthStore } from '@/store/authStore';

export function useCategoriesListener() {
  const userId = useAuthStore((s) => s.user?.id);
  const { setCategories, setLoading } = useCategoryStore();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToCategories(userId, (categories) => {
      setCategories(categories);
    });
    return () => unsubscribe();
  }, [userId, setCategories, setLoading]);
}
