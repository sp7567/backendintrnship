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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Vendors',
      value: data?.vendors?.total || 0,
      subtext: `${data?.vendors?.active || 0} active`,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      link: '/vendors',
    },
    {
      title: 'Purchase Orders',
      value: data?.purchaseOrders?.total || 0,
      subtext: 'Total POs',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      link: '/purchase-orders',
    },
    {
      title: 'Total Payments',
      value: data?.payments?.total || 0,
      subtext: `₹${(data?.payments?.totalAmount || 0).toLocaleString('en-IN')}`,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      gradient: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
      link: '/payments',
    },
    {
      title: 'Outstanding',
      value: `₹${(data?.financial?.totalOutstanding || 0).toLocaleString('en-IN')}`,
      subtext: 'Total due',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      link: '/analytics',
    },
  ];

  const poStatusData = data?.purchaseOrders?.byStatus || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 border border-blue-100"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-2">{card.value}</p>
                <p className="text-sm text-slate-400 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* PO Status & Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PO Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Purchase Order Status</h2>
            <Link to="/purchase-orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Draft', value: poStatusData.Draft || 0, color: 'bg-slate-400', lightBg: 'bg-slate-50' },
              { label: 'Approved', value: poStatusData.Approved || 0, color: 'bg-blue-500', lightBg: 'bg-blue-50' },
              { label: 'Partially Paid', value: poStatusData.PartiallyPaid || 0, color: 'bg-amber-500', lightBg: 'bg-amber-50' },
              { label: 'Fully Paid', value: poStatusData.FullyPaid || 0, color: 'bg-emerald-500', lightBg: 'bg-emerald-50' },
            ].map((status) => (
              <div key={status.label} className={`flex items-center justify-between p-3 rounded-xl ${status.lightBg}`}>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${status.color} mr-3`}></div>
                  <span className="text-slate-700 font-medium">{status.label}</span>
                </div>
                <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-lg shadow-sm">{status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Financial Overview</h2>
            <Link to="/analytics" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Analytics →
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-slate-700 font-medium">Total PO Amount</span>
              </div>
              <span className="font-bold text-blue-600 text-lg">
                ₹{(data?.financial?.totalPOAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-slate-700 font-medium">Total Paid</span>
              </div>
              <span className="font-bold text-emerald-600 text-lg">
                ₹{(data?.financial?.totalPaid || 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-100/50 rounded-xl border border-amber-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-slate-700 font-medium">Outstanding</span>
              </div>
              <span className="font-bold text-amber-600 text-lg">
                ₹{(data?.financial?.totalOutstanding || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/vendors"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Vendor
          </Link>
          <Link
            to="/purchase-orders"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Purchase Order
          </Link>
          <Link
            to="/payments"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Record Payment
          </Link>
          <Link
            to="/analytics"
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            View Reports
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
