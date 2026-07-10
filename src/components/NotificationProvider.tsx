'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface NotificationContextType {
  showAlert: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'error';
    isConfirm: boolean;
    confirmText?: string;
    onConfirm?: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setModal({
      title,
      message,
      type,
      isConfirm: false,
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirm') => {
    setModal({
      title,
      message,
      type: 'info',
      isConfirm: true,
      confirmText,
      onConfirm: () => {
        onConfirm();
        setModal(null);
      },
    });
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* Modern Dialog Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!modal.isConfirm) setModal(null);
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xl transition-all"
            >
              {/* Header Icon */}
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 rounded-full p-2 shrink-0 ${
                  modal.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : modal.type === 'error'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {modal.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : modal.type === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1.5 flex-grow">
                  <h3 className="font-serif text-lg font-light tracking-tight text-zinc-900 dark:text-white">
                    {modal.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs font-light leading-relaxed">
                    {modal.message}
                  </p>
                </div>

                {!modal.isConfirm && (
                  <button
                    onClick={() => setModal(null)}
                    className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                {modal.isConfirm ? (
                  <>
                    <button
                      onClick={() => setModal(null)}
                      className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-400 px-4 py-2 text-2xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={modal.onConfirm}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-4 py-2 text-2xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      {modal.confirmText || 'Confirm'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModal(null)}
                    className="rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-5 py-2 text-2xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <div className="fixed bottom-6 right-6 z-[110] max-w-sm w-full p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-4 shadow-lg transition-colors"
            >
              <div className={`rounded-full p-1.5 shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
              }`}>
                {toast.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : toast.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="text-2xs font-medium text-zinc-900 dark:text-white truncate">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => setToast(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}
