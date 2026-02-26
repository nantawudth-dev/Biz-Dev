
import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: string;
  subtitle?: React.ReactNode;
  headerClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon, maxWidth = 'max-w-md', subtitle, headerClassName }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in !mt-0"
      style={{ animationDuration: '0.3s', marginTop: 0 }}
      onClick={onClose}
    >
      <div
        className={`bg-white border border-slate-100 rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`px-6 py-4 border-b border-slate-100 shrink-0 rounded-t-2xl ${headerClassName || ''}`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
              {icon}
              <h2 className="text-xl font-semibold font-title text-slate-900 leading-snug">{title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-full hover:bg-white/60 transition-colors shrink-0 mt-0.5">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {subtitle && <div className="mt-3">{subtitle}</div>}
        </div>
        <div className="px-6 py-5 font-body overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;