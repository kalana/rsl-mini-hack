'use client';
import { useUIStore } from '@/store/uiStore';

export function useToast() {
  const addToast = useUIStore((s) => s.addToast);
  return {
    success: (message: string) => addToast({ message, variant: 'success' }),
    error:   (message: string) => addToast({ message, variant: 'error' }),
    info:    (message: string) => addToast({ message, variant: 'info' }),
  };
}
