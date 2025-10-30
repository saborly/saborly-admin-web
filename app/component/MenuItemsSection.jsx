// components/MenuItemsSection.jsx - Updated with client-side search fallback
import React, { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import SearchInput from './SearchInput';
import DataGrid from './DataGrid';

const MenuItemsSection = ({ 
  foodItems, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onDelete,
  pagination,
  onPageChange,
  apiService 
}) => {
  const [useClientSearch, setUseClientSearch] = useState(false);

  // Client-side search function
  const filteredItems = useMemo(() => {
    if (!searchTerm || !useClientSearch) return foodItems;
    
    const searchLower = searchTerm.toLowerCase();
    return foodItems.filter(item => {
      const name = getSafeName(item._multilingual?.name || item.name, apiService.language).toLowerCase();
      const category = getSafeName(item.category?._multilingual?.name || item.category?.name, apiService.language).toLowerCase();
      const description = getSafeName(item._multilingual?.description || item.description, apiService.language).toLowerCase();
      
      return name.includes(searchLower) || 
             category.includes(searchLower) || 
             description.includes(searchLower);
    });
  }, [foodItems, searchTerm, useClientSearch, apiService.language]);

  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '€0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

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
            {getSafeName(item.category?._multilingual?.name || item.category?.name, apiService.language)}
          </p>
        </div>
      ),
    },
    {
      header: 'Price',
      key: 'price',
      render: (item) => formatCurrency(item.price),
    },
    {
      header: 'Stock',
      key: 'stockQuantity',
      render: (item) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
            item.stockQuantity > (item.lowStockAlert || 10)
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {item.stockQuantity || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <div className="flex flex-col gap-2">
          <span
            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
              item.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
          <div className="flex gap-1">
            {item.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
            {item.isPopular && (
              <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Popular
              </span>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <SearchInput
          placeholder="Search menu items by name, category..."
          value={searchTerm}
          onChange={onSearchChange}
        />
        {useClientSearch && (
          <p className="text-xs text-gray-500 mt-2">
            Using client-side search ({filteredItems.length} items found)
          </p>
        )}
      </div>

      <DataGrid
        data={useClientSearch ? filteredItems : foodItems}
        title="Menu Items"
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onEdit={(item) => onEdit('menu-item', item)}
        onDelete={(id) => onDelete(id, 'food-item')}
        onAdd={() => onEdit('menu-item')}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      
      {/* Fallback button for client-side search */}
      {searchTerm && !loading && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800 mb-2">
            Server search not available. Use client-side search instead?
          </p>
          <button
            onClick={() => setUseClientSearch(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600"
          >
            Enable Client-Side Search
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuItemsSection;