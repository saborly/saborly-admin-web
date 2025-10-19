// components/NotificationBell.jsx
'use client';
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';

const NotificationBell = ({ 
  notification, 
  onClear, 
  onNotificationClick,
  fcmToken,
  permissionStatus,
  requestPermission 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (notification) {
      setHasUnread(true);
      setShowDropdown(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowDropdown(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleNotificationClick = () => {
    setHasUnread(false);
    if (onNotificationClick && notification) {
      onNotificationClick(notification);
    }
    setShowDropdown(false);
  };

  const handleClear = () => {
    setHasUnread(false);
    if (onClear) {
      onClear();
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-3 hover:bg-gray-100 rounded-2xl transition-all duration-200"
      >
        <Bell className={`w-6 h-6 ${hasUnread ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
        )}
        {hasUnread && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Notification Permission Banner */}
      {permissionStatus !== 'granted' && showDropdown && (
        <div className="absolute right-0 top-16 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Enable Notifications</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get instant alerts for new orders
              </p>
              {permissionStatus === 'denied' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Notifications blocked. Enable in browser settings.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    requestPermission();
                    setShowDropdown(false);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  Enable Now
                </button>
              )}
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Dropdown */}
      {notification && showDropdown && permissionStatus === 'granted' && (
        <div className="absolute right-0 top-16 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              New Notification
            </h3>
            <button
              onClick={handleClear}
              className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notification Content */}
          <div className="p-4">
            <div 
              onClick={handleNotificationClick}
              className="cursor-pointer hover:bg-gray-50 p-4 rounded-xl transition-colors border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.body}
                  </p>
                  {notification.data && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {notification.data.orderNumber && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {notification.data.orderNumber}
                        </span>
                      )}
                      {notification.data.total && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          €{notification.data.total}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleNotificationClick}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                View Order
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Status Indicator (for debugging - remove in production) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="absolute right-0 top-full mt-2 text-xs">
          <div className={`px-2 py-1 rounded ${fcmToken ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {fcmToken ? '✓ Connected' : '✗ No Token'}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default NotificationBell;