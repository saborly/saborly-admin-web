// components/OrdersSection.jsx
import React from 'react';
import { Eye, Calendar, Users, MapPin, PhoneCallIcon, LocationEdit } from 'lucide-react';
import SearchInput from './SearchInput';
import DataGrid from './DataGrid';

const OrdersSection = ({ 
  orders, 
  loading, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onStatusUpdate,
  pagination,
  onPageChange,
  apiService 
}) => {
  const formatCurrency = (amount, currency = 'EUR') => {
    if (isNaN(amount)) return '€0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-orange-100 text-orange-800 border-orange-200',
      ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'out-for-delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSafeName = (name, language) => {
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object') {
      return name[language] || name.en || Object.values(name)[0] || 'Unknown Item';
    }
    return 'Unknown Item';
  };

  const columns = [
    {
      header: 'Order #',
      key: 'orderNumber',
      render: (item) => (
        <div>
          <p className="font-bold text-gray-900">{item.orderNumber || `#${item._id?.slice(-6)}`}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            {formatDate(item.createdAt)}
          </p>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'userId',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{item.userId?.fullName || item.customerName || 'Unknown'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Address',
      key: 'deliveryType',
      render: (item) => (
        item.deliveryType === 'delivery' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <LocationEdit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {item.deliveryAddress?.address},<br />
                {item.deliveryAddress?.apartment}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <LocationEdit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{item.deliveryType}</p>
            </div>
          </div>
        )
      ),
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <PhoneCallIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            {item.userId?.phone ? (
              <a
                href={`tel:${item.userId.phone}`}
                className="font-semibold text-gray-900 hover:text-blue-600"
              >
                {item.userId.phone}
              </a>
            ) : (
              <p className="font-semibold text-gray-900">Unknown</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Items',
      key: 'items',
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 font-medium">
            {item.items?.slice(0, 2).map((orderItem) => 
              getSafeName(orderItem.foodItem?.name, apiService.language)
            ).join(', ')}
            {item.items?.length > 2 && <span className="text-gray-500"> +{item.items.length - 2} more</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">{item.items?.length || 0} items total</p>
          {item.items?.some(orderItem => orderItem.specialInstructions) && (
            <p className="text-xs text-gray-500">
              Special Instructions available
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Total',
      key: 'total',
      render: (item) => (
        <div>
          <p className="font-bold text-lg text-gray-900">
            {formatCurrency(item.total)}
          </p>
          {item.deliveryType === 'delivery' && item.deliveryFee && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              Delivery fee included ({formatCurrency(item.deliveryFee)})
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <select
          className={`text-xs font-semibold rounded-xl px-3 py-2 border-0 cursor-pointer transition-all hover:shadow-md ${getStatusColor(item.status)}`}
          value={item.status}
          onChange={(e) => onStatusUpdate(item._id, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="out-for-delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  const actions = [
    {
      icon: Eye,
      label: 'View Details',
      color: 'blue',
      onClick: (item) => onEdit('order-details', item),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <SearchInput
          placeholder="Search orders by customer name, order number..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      <DataGrid
        data={orders}
        title="Orders"
        columns={columns}
        actions={actions}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onEdit={onEdit}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    </div>
  );
};

export default OrdersSection;