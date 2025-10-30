// components/BannersSection.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import SearchInput from './SearchInput';
import DataGrid from './DataGrid';

const BannersSection = ({ 
  banners, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onDelete,
  onAdd,
  apiService,
  showNotificationDialog 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const handleToggleStatus = async (item) => {
    try {
      await apiService.toggleBannerStatus(item._id);
      showNotificationDialog('Success!', 'Banner status updated successfully');
      // You might want to reload banners here or update local state
    } catch (error) {
      showNotificationDialog('Error', 'Error updating banner status: ' + error.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Image',
      key: 'imageUrl',
      render: (item) => (
        <div className="relative">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-32 h-16 object-cover rounded-2xl border-2 border-gray-100"
          />
        </div>
      ),
    },
    {
      header: 'Title',
      key: 'title',
      render: (item) => (
        <div>
          <p className="font-bold text-gray-900">{item.title}</p>
          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      render: (item) => (
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
          {item.category?.name || item.category || 'None'}
        </span>
      ),
    },
    {
      header: 'Order',
      key: 'order',
      render: (item) => (
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
          {item.order || 0}
        </span>
      ),
    },
    {
      header: 'Schedule',
      key: 'schedule',
      render: (item) => (
        <div className="text-sm">
          <p className="text-gray-900">{item.startDate ? formatDate(item.startDate) : 'No start date'}</p>
          <p className="text-xs text-gray-500">to {item.endDate ? formatDate(item.endDate) : 'No end date'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'isActive',
      render: (item) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
            item.isActive 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const actions = [
    {
      icon: RefreshCw,
      label: 'Toggle Status',
      color: 'purple',
      onClick: handleToggleStatus,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <SearchInput
          placeholder="Search banners by title, description..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <DataGrid
        data={banners}
        title="Banners"
        columns={columns}
        actions={actions}
        loading={loading}
        onEdit={(item) => onEdit('banner', item)}
        onDelete={(id) => onDelete(id, 'banner')}
        onAdd={() => onAdd('banner')}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};

export default BannersSection;