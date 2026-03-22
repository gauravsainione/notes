import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  type = 'danger' // 'danger', 'info', 'warning'
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      button: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600',
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      button: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600',
    },
    info: {
      icon: <Info className="h-6 w-6 text-primary-600 dark:text-primary-400" />,
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      button: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600',
    }
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all dark:bg-slate-900 border border-gray-100 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${config.bg}`}>
            {config.icon}
          </div>

          <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            {message}
          </p>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-lg ${config.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
