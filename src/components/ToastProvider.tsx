import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-[#00FF88]" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#FF5500]" />,
  info: <Info className="w-4 h-4 text-[#00FFFF]" />,
};

const borderColors: Record<ToastType, string> = {
  success: '#00FF8840',
  error: '#ff313140',
  warning: '#FF550040',
  info: '#00FFFF40',
};

const glowColors: Record<ToastType, string> = {
  success: '0 0 15px #00FF8825',
  error: '0 0 15px #ff313125',
  warning: '0 0 15px #FF550025',
  info: '0 0 15px #00FFFF25',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-sm"
              style={{
                background: 'rgba(10,10,18,0.95)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${borderColors[toast.type]}`,
                boxShadow: glowColors[toast.type],
              }}
            >
              {icons[toast.type]}
              <span className="text-sm text-white flex-1">{toast.message}</span>
              <button
                className="text-gray-500 hover:text-white transition-colors"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
