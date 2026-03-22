import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

const PromptModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Input Required', 
  message = 'Please enter the details below:', 
  placeholder = 'Type here...',
  confirmText = 'Submit', 
  cancelText = 'Cancel',
  type = 'info'
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) setValue('');
  }, [isOpen]);

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
      button: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-500 dark:hover:bg-rose-600',
    },
    info: {
      button: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-600',
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 shadow-2xl transition-all dark:bg-slate-900 border border-gray-100 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {message}
          </p>

          <textarea
            autoFocus
            rows="4"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="mb-8 w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-primary-500"
          />

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm(value);
                onClose();
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition shadow-lg ${config.button}`}
            >
              <Send className="h-4 w-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptModal;
