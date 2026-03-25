'use client';
import { useEffect } from 'react';
import { subscribeToTransactions } from '@/lib/firebase/firestore';
import { useTransactionStore } from '@/store/transactionStore';
import { useAuthStore } from '@/store/authStore';

export function useTransactionsListener() {
  const userId = useAuthStore((s) => s.user?.id);
  const { setTransactions, setLoading } = useTransactionStore();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToTransactions(userId, (transactions) => {
      setTransactions(transactions);
    });
    return () => unsubscribe();
  }, [userId, setTransactions, setLoading]);
}
