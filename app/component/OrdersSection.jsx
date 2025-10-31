'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { Loader2, Eye, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const SearchInput = React.memo(({ placeholder, value, onChange, onClear }) => {
  const inputRef = useRef(null);
  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});
SearchInput.displayName = 'SearchInput';

export const OrdersGrid = ({ onView, apiService, language = 'en' }) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [isSearching, setIsSearching] = useState(false);

  const load = useCallback(
    async (page = 1, search = debouncedSearch) => {
      setLoading(true);
      setIsSearching(search !== '');
      try {
        const res = await apiService.getOrders({ page, limit: 10, search });
        setOrders(res.orders || []);
        setPagination({
          currentPage: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          totalOrders: res.totalOrders || 0,
        });
      } catch (e) {
        console.error('Orders load error:', e);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [apiService, debouncedSearch]
  );

  // Initial load - only on mount
  useEffect(() => {
    load(1, '');
  }, []); // Remove load from dependencies

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      load(1, debouncedSearch);
    }
  }, [debouncedSearch, load]);

  const handleClear = () => {
    setSearchTerm('');
    // Don't call load here - the useEffect will handle it
  };

  const handlePageChange = (newPage) => {
    load(newPage, debouncedSearch);
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(v || 0);

  const formatDate = (d) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));

  const getStatusColor = (s) => {
    const map = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'out-for-delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return map[s] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus, `Status → ${newStatus}`);
      load(pagination.currentPage, debouncedSearch);
    } catch (e) {
      console.error(e);
    }
  };

  const getCustomerName = (o) => o.customerName || o.userId?.firstName || 'Guest';
  const getPhone = (o) => o.userId?.phone || '—';
  const getAddress = (o) => {
    if (o.deliveryType === 'pickup') return 'Pickup';
    const a = o.deliveryAddress;
    return a ? `${a.address}${a.apartment ? `, ${a.apartment}` : ''}` : '—';
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border-0 overflow-hidden">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <p className="text-sm text-gray-600 mt-1">All customer orders</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <SearchInput
              placeholder="Search orders..."
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

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Address', 'Phone', 'Items', 'Total', 'Status'].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                  <th className="px-8 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-50 hover:bg-gray-50 transition-all duration-200">
                    <td className="px-8 py-6 text-sm font-medium text-gray-900">
                      #{o.orderNumber || o._id.slice(-6)}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-900">
                      <div>
                        <p className="font-semibold">{getCustomerName(o)}</p>
                        <p className="text-xs text-gray-500">{formatDate(o.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-700 max-w-xs truncate">{getAddress(o)}</td>
                    <td className="px-8 py-6 text-sm text-gray-700">{getPhone(o)}</td>
                    <td className="px-8 py-6 text-sm text-gray-700">
                      {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-8 py-6">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className={`text-xs font-semibold rounded-xl px-3 py-2 border cursor-pointer transition ${getStatusColor(o.status)}`}
                      >
                        {[
                          'pending',
                          'confirmed',
                          'preparing',
                          'ready',
                          'out-for-delivery',
                          'delivered',
                          'cancelled',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => onView(o)}
                        className="p-2 rounded-xl text-blue-600 hover:text-blue-900 hover:bg-blue-50 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {orders.length} of {pagination.totalOrders} orders
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-semibold text-gray-900">
                  Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  


    )}