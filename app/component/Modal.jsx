// components/Modal.jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  showModal, 
  closeModal, 
  modalType, 
  editingItem,
  onSave,
  showNotificationDialog 
}) => {
  if (!showModal) return null;

  const getModalConfig = () => {
    const configs = {
      category: { title: `${editingItem ? 'Edit' : 'Add'} Category`, size: 'max-w-4xl' },
      'menu-item': { title: `${editingItem ? 'Edit' : 'Add'} Menu Item`, size: 'max-w-6xl' },
      banner: { title: `${editingItem ? 'Edit' : 'Add'} Banner`, size: 'max-w-6xl' },
      'order-details': { title: 'Order Details', size: 'max-w-5xl' },
    };
    return configs[modalType] || { title: 'Modal', size: 'max-w-4xl' };
  };

  const { title, size } = getModalConfig();

  const renderModalContent = () => {
    switch (modalType) {
      case 'category':
        return <div>Category Form Coming Soon</div>;
      case 'menu-item':
        return <div>Menu Item Form Coming Soon</div>;
      case 'banner':
        return <div>Banner Form Coming Soon</div>;
      case 'order-details':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <h4 className="font-bold text-lg mb-4">Order Details</h4>
              <p>Order details for: {editingItem?.orderNumber || editingItem?._id}</p>
            </div>
          </div>
        );
      default:
        return <div>Modal content not available</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`bg-white rounded-3xl ${size} w-full max-h-[90vh] overflow-hidden shadow-2xl border-0`}>
        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={closeModal}
            className="p-3 hover:bg-white hover:bg-opacity-60 rounded-2xl transition-all duration-200 group"
          >
            <X className="w-6 h-6 text-gray-600 group-hover:text-gray-900" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default Modal;