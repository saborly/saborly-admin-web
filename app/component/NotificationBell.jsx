// components/NotificationBell.jsx
import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = ({
  notification,
  onClear,
  onNotificationClick,
  fcmToken,
  permissionStatus,
  requestPermission
}) => {
  return (
    <div className="relative">
      <button className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-200 relative">
        <Bell className="w-6 h-6" />
        {notification && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>
      
      {permissionStatus === 'default' && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-50">
          <p className="text-sm text-gray-600">
            Enable notifications to get alerts for new orders
          </p>
          <button
            onClick={requestPermission}
            className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
          >
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;