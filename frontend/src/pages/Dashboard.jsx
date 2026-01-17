import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vendors',
      value: stats?.totalVendors || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      link: '/vendors'
    },
    {
      title: 'Purchase Orders',
      value: stats?.totalPurchaseOrders || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-600',
      link: '/purchase-orders'
    },
    {
      title: 'Total Payments',
      value: stats?.totalPayments || 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'violet',
      bgGradient: 'from-violet-500 to-violet-600',
      link: '/payments'
    },
    {
      title: 'Outstanding Amount',
      value: formatCurrency(stats?.totalOutstanding || 0),
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'amber',
      bgGradient: 'from-amber-500 to-amber-600',
      link: '/analytics'
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700 border border-amber-200',
      PARTIALLY_PAID: 'bg-blue-100 text-blue-700 border border-blue-200',
      PAID: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      CANCELLED: 'bg-gray-100 text-gray-700 border border-gray-200',
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your vendors.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link
            to="/purchase-orders"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Order
          </Link>
          <Link
            to="/vendors"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Vendor
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
              <div className={`w-full h-full bg-gradient-to-br ${card.bgGradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            </div>
            <div className="relative">
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${card.bgGradient} rounded-xl text-white shadow-lg mb-4`}>
                {card.icon}
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Orders</h2>
            </div>
            <Link to="/purchase-orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentPurchaseOrders?.slice(0, 5).map((po) => (
              <Link
                key={po.id}
                to={`/purchase-orders/${po.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-semibold text-gray-600 text-sm">
                    {po.vendor?.name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{po.poNumber}</p>
                    <p className="text-sm text-gray-500">{po.vendor?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(po.status)}`}>
                    {po.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
            {(!stats?.recentPurchaseOrders || stats.recentPurchaseOrders.length === 0) && (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No purchase orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
            </div>
            <Link to="/payments" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentPayments?.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.purchaseOrder?.poNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">+{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-gray-500">{payment.paymentMethod}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentPayments || stats.recentPayments.length === 0) && (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-gray-500">No payments yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Payment Summary</h3>
            <p className="text-blue-200">Overview of your payment activities</p>
          </div>
          <Link
            to="/analytics"
            className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
          >
            View Analytics
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm mb-1">Total PO Value</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalPOValue || 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm mb-1">Total Paid</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalPaid || 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm mb-1">Outstanding</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalOutstanding || 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-200 text-sm mb-1">Payment Rate</p>
            <p className="text-2xl font-bold">
              {stats?.totalPOValue ? Math.round((stats.totalPaid / stats.totalPOValue) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
