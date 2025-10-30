// components/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  type = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all border-0 overflow-hidden">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-50' : 'bg-amber-50'
          }`}>
            {type === 'danger' ? (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all duration-200 hover:scale-[0.98]"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg ${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;