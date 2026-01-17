import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vendors',
      value: data?.vendors?.total || 0,
      subtext: `${data?.vendors?.active || 0} active`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-700',
      bgLight: 'bg-blue-50',
      link: '/vendors',
    },
    {
      title: 'Purchase Orders',
      value: data?.purchaseOrders?.total || 0,
      subtext: 'Total POs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-indigo-700',
      bgLight: 'bg-indigo-50',
      link: '/purchase-orders',
    },
    {
      title: 'Total Payments',
      value: data?.payments?.total || 0,
      subtext: `₹${(data?.payments?.totalAmount || 0).toLocaleString('en-IN')}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      gradient: 'from-sky-500 to-sky-700',
      bgLight: 'bg-sky-50',
      link: '/payments',
    },
    {
      title: 'Outstanding',
      value: `₹${(data?.financial?.totalOutstanding || 0).toLocaleString('en-IN')}`,
      subtext: 'Total due',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      link: '/analytics',
    },
  ];

  const poStatusData = data?.purchaseOrders?.byStatus || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-100 rounded-xl hover:bg-blue-200 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-6 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} mr-2`}></span>
                  {card.subtext}
                </p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PO Status & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PO Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Purchase Order Status
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Draft', value: poStatusData.Draft || 0, color: 'bg-gray-400', textColor: 'text-gray-600' },
              { label: 'Approved', value: poStatusData.Approved || 0, color: 'bg-blue-500', textColor: 'text-blue-600' },
              { label: 'Partially Paid', value: poStatusData.PartiallyPaid || 0, color: 'bg-amber-500', textColor: 'text-amber-600' },
              { label: 'Fully Paid', value: poStatusData.FullyPaid || 0, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
            ].map((status) => (
              <div key={status.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${status.color} mr-4 shadow-sm`}></div>
                  <span className="text-gray-700 font-medium">{status.label}</span>
                </div>
                <span className={`text-xl font-bold ${status.textColor}`}>{status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Financial Overview
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total PO Amount</span>
                <span className="text-2xl font-bold text-blue-700">
                  ₹{(data?.financial?.totalPOAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-xl border border-emerald-200/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Total Paid</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₹{(data?.financial?.totalPaid || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-100/50 rounded-xl border border-amber-200/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Outstanding</span>
                <span className="text-2xl font-bold text-amber-600">
                  ₹{(data?.financial?.totalOutstanding || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            <Link
              to="/vendors"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Vendor
            </Link>
            <Link
              to="/purchase-orders"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Purchase Order
            </Link>
            <Link
              to="/payments"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-semibold rounded-xl hover:from-sky-700 hover:to-sky-800 shadow-lg shadow-sky-500/25 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Record Payment
            </Link>
            <Link
              to="/analytics"
              className="flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
