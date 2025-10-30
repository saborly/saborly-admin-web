// components/DashboardStats.jsx
import React from 'react';
import { Euro, ShoppingBag, Users, Package, Percent, TrendingUp, ChevronDown } from 'lucide-react';

const DashboardStats = ({ stats, orders }) => {
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return '€0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
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

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.revenue.current),
      growth: `+${stats.revenue.growth}%`,
      icon: Euro,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
    },
    {
      title: 'Total Orders',
      value: stats.orders.current.toLocaleString(),
      growth: `+${stats.orders.growth}%`,
      icon: ShoppingBag,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Active Customers',
      value: stats.customers.current.toLocaleString(),
      growth: `+${stats.customers.growth}%`,
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Menu Items',
      value: stats.menuItems.current,
      growth: `${stats.menuItems.growth}% growth`,
      icon: Package,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
    },
    {
      title: 'Active Offers',
      value: stats.activeOffers.current,
      growth: `+${stats.activeOffers.growth}%`,
      icon: Percent,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`relative p-8 rounded-3xl shadow-lg border-0 bg-gradient-to-br ${stat.bgGradient} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden`}
          >
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-3 leading-none">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white bg-opacity-70 rounded-full">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">{stat.growth}</span>
                  </div>
                </div>
              </div>
              <div className={`${stat.iconBg} p-4 rounded-2xl shadow-lg`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl shadow-lg border-0 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
            <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
            View All <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </button>
        </div>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{order.orderNumber || `Order #${order._id?.slice(-6)}`}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4" />
                    {order.userId?.fullName || order.customerName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</p>
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;