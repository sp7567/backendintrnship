import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Vendors', href: '/vendors', icon: '🏢' },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: '📋' },
    { name: 'Payments', href: '/payments', icon: '💳' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
  ];

  const isActive = (href) => location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-primary-700">
          <h1 className="text-xl font-bold text-white">MSME Vendor Pay</h1>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md mb-1 transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-900 text-white'
                  : 'text-primary-100 hover:bg-primary-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="text-2xl">☰</span>
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, <strong>{user?.username || 'User'}</strong>
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
