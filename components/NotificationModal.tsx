
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from './icons';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type: 'success' | 'error' | 'delete';
}

const icons = {
    success: <CheckCircleIcon className="w-12 h-12 text-green-500" />,
    error: <XCircleIcon className="w-12 h-12 text-red-500" />,
    delete: <TrashIcon className="w-12 h-12 text-red-500" />,
};

const buttonColors = {
    error: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
};

const titleText = {
    success: 'สำเร็จ!',
    error: 'เกิดข้อผิดพลาด!',
    delete: 'ลบสำเร็จ!',
};

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, message, type }) => {
  useEffect(() => {
    if (isOpen && (type === 'success' || type === 'delete')) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4 animate-fade-in"
      style={{ animationDuration: '0.3s' }}
    >
      <div
        className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-sm animate-scale-in text-center p-8"
      >
        <div className="flex justify-center mb-4">
            {icons[type]}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{titleText[type]}</h2>
        <p className="text-slate-600 mb-8 font-body">{message}</p>
        
        {(type === 'success' || type === 'delete') ? (
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className={`${type === 'success' ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full animate-progress-bar-fill`}></div>
            </div>
        ) : (
            <button
                onClick={onClose}
                className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition-colors ${buttonColors.error} focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
                ตกลง
            </button>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;