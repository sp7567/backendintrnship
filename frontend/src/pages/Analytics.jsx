import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [vendorOutstanding, setVendorOutstanding] = useState([]);
  const [paymentAging, setPaymentAging] = useState(null);
  const [paymentTrends, setPaymentTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [vendorRes, agingRes, trendsRes] = await Promise.all([
        api.get('/analytics/vendor-outstanding'),
        api.get('/analytics/payment-aging'),
        api.get('/analytics/payment-trends'),
      ]);
      setVendorOutstanding(vendorRes.data);
      setPaymentAging(agingRes.data);
      setPaymentTrends(trendsRes.data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
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
          <p className="mt-4 text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalOutstanding = vendorOutstanding.reduce((sum, v) => sum + v.outstanding, 0);
  const maxTrend = Math.max(...paymentTrends.map((t) => t.total), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 mt-1">Gain insights into your payment activities</p>
      </div>

      {/* Payment Aging Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Aging Report</h2>
                <p className="text-sm text-gray-500">Outstanding amounts by age</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium mb-1">0-30 Days</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(paymentAging?.['0-30'] || 0)}</p>
                <div className="mt-2 h-2 bg-emerald-200 rounded-full">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium mb-1">31-60 Days</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(paymentAging?.['31-60'] || 0)}</p>
                <div className="mt-2 h-2 bg-blue-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-sm text-amber-600 font-medium mb-1">61-90 Days</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(paymentAging?.['61-90'] || 0)}</p>
                <div className="mt-2 h-2 bg-amber-200 rounded-full">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm text-red-600 font-medium mb-1">90+ Days</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(paymentAging?.['90+'] || 0)}</p>
                <div className="mt-2 h-2 bg-red-200 rounded-full">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Trends */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Trends</h2>
                <p className="text-sm text-gray-500">Monthly payment activity</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {paymentTrends.slice(-6).map((trend, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium text-gray-600">{trend.month}</div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${(trend.total / maxTrend) * 100}%` }}
                      >
                        {trend.total > 0 && (
                          <span className="text-xs font-semibold text-white">{formatCurrency(trend.total)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {paymentTrends.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payment data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Outstanding */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vendor Outstanding Report</h2>
              <p className="text-sm text-gray-500">Amount due to each vendor</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-4 py-2 text-white">
            <p className="text-xs text-blue-200">Total Outstanding</p>
            <p className="text-lg font-bold">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Orders
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {vendorOutstanding.map((vendor) => {
                const paymentPercentage = vendor.totalAmount > 0 
                  ? Math.round((vendor.paidAmount / vendor.totalAmount) * 100) 
                  : 0;
                return (
                  <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
                          {vendor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vendor.name}</p>
                          {vendor.email && <p className="text-sm text-gray-500">{vendor.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        {vendor.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(vendor.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                      {formatCurrency(vendor.paidAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-amber-600">{formatCurrency(vendor.outstanding)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              paymentPercentage === 100 
                                ? 'bg-emerald-500' 
                                : paymentPercentage > 50 
                                ? 'bg-blue-500' 
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${paymentPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-10">{paymentPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {vendorOutstanding.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">Create vendors and purchase orders to see analytics.</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-6">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-blue-100 text-sm">Active Vendors</span>
            </div>
            <p className="text-3xl font-bold">{vendorOutstanding.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-blue-100 text-sm">Avg Outstanding</span>
            </div>
            <p className="text-3xl font-bold">
              {vendorOutstanding.length > 0 
                ? formatCurrency(totalOutstanding / vendorOutstanding.length) 
                : '₹0'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-blue-100 text-sm">This Month</span>
            </div>
            <p className="text-3xl font-bold">
              {paymentTrends.length > 0 
                ? formatCurrency(paymentTrends[paymentTrends.length - 1]?.total || 0) 
                : '₹0'}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-blue-100 text-sm">Fully Paid</span>
            </div>
            <p className="text-3xl font-bold">
              {vendorOutstanding.filter((v) => v.outstanding === 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
