'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import type { Toast } from '@/types';

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const styles = {
    success: { border: '#4ade80', icon: '✓', bg: '#f0fdf4', text: '#166534' },
    error:   { border: '#f87171', icon: '✕', bg: '#fef2f2', text: '#991b1b' },
    info:    { border: '#60a5fa', icon: 'ℹ', bg: '#eff6ff', text: '#1e40af' },
  };
  const s = styles[toast.variant];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-[var(--shadow-modal)] max-w-sm w-full"
      style={{ backgroundColor: s.bg, borderLeft: `4px solid ${s.border}` }}
    >
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: s.border }}
      >
        {s.icon}
      </span>
      <p className="text-sm font-medium flex-1" style={{ color: s.text }}>
        {toast.message}
      </p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none"
      >
        ×
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
