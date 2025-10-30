// components/CategoriesSection.jsx
import React from 'react';
import SearchInput from './SearchInput';
import DataGrid from './DataGrid';

const CategoriesSection = ({ 
  categories, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onDelete,
  onAdd,
  apiService 
}) => {
  const getSafeName = (name, language) => {
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object') {
      return name[language] || name.en || Object.values(name)[0] || 'Unnamed';
    }
    return 'Unnamed';
  };

  const columns = [
    {
      header: 'Image',
      key: 'imageUrl',
      render: (item) => (
        <img
          src={item.imageUrl}
          alt={getSafeName(item._multilingual?.name || item.name, apiService.language)}
          className="w-16 h-16 object-cover rounded-xl"
        />
      ),
    },
    {
      header: 'Name',
      key: 'name',
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">
            {getSafeName(item._multilingual?.name || item.name, apiService.language)}
          </p>
          <p className="text-xs text-gray-500">
            {getSafeName(item._multilingual?.description || item.description, apiService.language) || 'No description'}
          </p>
        </div>
      ),
    },
    {
      header: 'Icon',
      key: 'icon',
      render: (item) => <span className="text-2xl">{item.icon}</span>,
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
    {
      header: 'Sort Order',
      key: 'sortOrder',
      render: (item) => item.sortOrder,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <SearchInput
          placeholder="Search categories by name..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <DataGrid
        data={categories}
        title="Categories"
        columns={columns}
        loading={loading}
        onEdit={(item) => onEdit('category', item)}
        onDelete={(id) => onDelete(id, 'category')}
        onAdd={() => onAdd('category')}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};

export default CategoriesSection;