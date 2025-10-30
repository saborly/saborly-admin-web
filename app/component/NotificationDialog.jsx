// components/NotificationDialog.jsx
import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

const NotificationDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "success" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all border-0 overflow-hidden">
        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'success' ? 'bg-emerald-50' : 'bg-red-50'
          }`}>
            {type === 'success' ? (
              <Check className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg ${
              type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDialog;