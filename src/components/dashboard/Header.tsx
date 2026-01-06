'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Wallet,
  Calendar,
  Landmark,
  Inbox,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { getUserCurrencySymbol } from '@/lib/currency';

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  isRead: boolean;
  createdAt: string;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDate(now.toLocaleDateString(undefined, options));
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Use user's currency with fallback to USD
  const userCurrency = user?.currency || 'USD';
  const currencySymbol = getUserCurrencySymbol(userCurrency);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="shadow-sm z-20 sticky top-0" style={{ backgroundColor: 'rgb(17 24 39 / 0.8)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile: Logo + Menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            type="button"
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/dashboard" className="ml-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Landmark className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">{settings.siteName}</span>
          </Link>
        </div>

        {/* Desktop: Current Date */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center">
          <div className="text-sm text-gray-400 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Right Nav Items */}
        <div className="flex items-center space-x-4">
          {/* Balance indicator (desktop only) */}
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: '#1a2332' }}>
            <Wallet className="h-4 w-4 text-cyan-500 mr-2" />
            <span className="text-sm font-medium text-white">
              {currencySymbol}{formatCurrency(user?.balance || 0)}
            </span>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-1 text-gray-400 hover:text-white focus:outline-none"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notification dropdown */}
            {notificationsOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <button className="text-xs text-cyan-600 hover:text-cyan-700">
                      Mark all as read
                    </button>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <Link
                        key={notification.id}
                        href={`/dashboard/notifications/${notification.id}`}
                        className={`block px-4 py-3 hover:bg-gray-50 transition ${
                          notification.isRead ? 'opacity-60' : ''
                        }`}
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className={`flex items-center justify-center h-9 w-9 rounded-full ${
                              notification.type === 'success' ? 'bg-green-100 text-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                              notification.type === 'danger' ? 'bg-red-100 text-red-500' :
                              'bg-blue-100 text-blue-500'
                            }`}>
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <Inbox className="h-8 w-8 mx-auto text-gray-300 mb-1" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-100 text-center">
                  <Link
                    href="/dashboard/notifications"
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setUserDropdownOpen(!userDropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
            >
              {user?.profilePhoto ? (
                <img
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                  src={user.profilePhoto}
                  alt={user.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-semibold border-2 border-gray-200">
                  {user?.name ? getInitials(user.name) : 'U'}
                </div>
              )}
            </button>

            {/* User dropdown */}
            {userDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user?.accountNumber || '---'}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  Profile Settings
                </Link>
                <Link
                  href="/dashboard/support"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  Help & Support
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
