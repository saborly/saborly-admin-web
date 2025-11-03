import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Loader2, Edit3, Trash2, Plus, Star, Search, X } from 'lucide-react';

const SearchInput = React.memo(
  ({ placeholder, value, onChange, onClear, className = '' }) => {
    const inputRef = useRef(null);

    const handleClear = useCallback(() => {
      onChange('');
      onClear?.();
      inputRef.current?.focus();
    }, [onChange, onClear]);

    const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);

    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          className={`w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export const MenuItemsGrid = ({
  onEdit,
  onAdd,
  onDelete,
  apiService,
  language = 'en',
}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [isSearching, setIsSearching] = useState(false);

  // Define load function with useCallback to prevent infinite re-renders
  const load = useCallback(
    async (page = 1, search = '') => {
      setLoading(true);
      setIsSearching(search !== '');
      try {
        const res = await apiService.getFoodItems({
          page,
          limit: 10,
          search,
          includeInactive: true,
          lang: language,
        });
        setItems(res.items || []);
        setPagination({
          currentPage: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          totalItems: res.totalItems || 0,
        });
      } catch (e) {
        console.error('Menu items load error:', e);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [apiService, language] // Remove debouncedSearch from dependencies
  );

  // Initial load - only on mount and when language changes
  useEffect(() => {
    load(1, '');
  }, [language]); // Remove load from dependencies

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      load(1, debouncedSearch);
    }
  }, [debouncedSearch]); // Remove load from dependencies

  const handleClear = () => {
    setSearchTerm('');
    // Don't call load here - the useEffect will handle it automatically
  };

  const handlePageChange = (newPage) => {
    load(newPage, debouncedSearch);
  };

  const formatCurrency = (number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(number || 0);

  const getSafeName = (obj, lang) => {
    if (typeof obj === 'string') return obj;
    if (obj && typeof obj === 'object') {
      return obj[lang] ?? obj.en ?? obj.fr ?? Object.values(obj)[0] ?? 'Unnamed';
    }
    return 'Unnamed';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your menu</p>
          </div>
          <button
            onClick={onAdd}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 flex items-center gap-3 transition-all duration-200 hover:scale-[0.98] shadow-lg shadow-blue-200 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchInput
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={handleClear}
            />
            {isSearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {['Image', 'Name', 'Price', 'Stock', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {items.map((it) => (
                  <tr
                    key={it._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-8 py-6">
                      {it.imageUrl ? (
                        <img
                          src={it.imageUrl}
                          alt={getSafeName(it._multilingual?.name ?? it.name, language)}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="bg-gray-200 w-16 h-16 rounded-xl" />
                      )}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-900">
                      <div>
                        <p className="font-semibold">
                          {getSafeName(it._multilingual?.name ?? it.name, language)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getSafeName(
                            it.category?._multilingual?.name ?? it.category?.name,
                            language
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-900">
                      {formatCurrency(it.price)}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                          (it.stockQuantity ?? 0) > (it.lowStockAlert ?? 0)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {it.stockQuantity ?? 0}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                            it.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {it.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <div className="flex gap-1">
                          {it.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                          {it.isPopular && (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onEdit(it)}
                          className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(it._id)}
                          className="p-2 rounded-xl text-red-600 hover:text-red-900 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {items.length} of {pagination.totalItems} items
              </p>
              <div className="flex items-center gap-4">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-900">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-200 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No menu items found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first menu item.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};