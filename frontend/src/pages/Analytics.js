import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('outstanding');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'outstanding':
          response = await analyticsAPI.getVendorOutstanding();
          break;
        case 'aging':
          response = await analyticsAPI.getPaymentAging();
          break;
        case 'trends':
          response = await analyticsAPI.getPaymentTrends();
          break;
        default:
          response = await analyticsAPI.getVendorOutstanding();
      }
      setData(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'outstanding', name: 'Vendor Outstanding', icon: '💰' },
    { id: 'aging', name: 'Payment Aging', icon: '📅' },
    { id: 'trends', name: 'Payment Trends', icon: '📈' },
  ];

  const renderOutstandingReport = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-100">
            <p className="text-sm font-medium text-blue-600">Total Vendors</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{data.summary?.totalVendors || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-xl p-5 border border-amber-100">
            <p className="text-sm font-medium text-amber-600">Total Outstanding</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              ₹{(data.summary?.totalOutstanding || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-5 border border-emerald-100">
            <p className="text-sm font-medium text-emerald-600">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              ₹{(data.summary?.totalPaid || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-5 border border-violet-100">
            <p className="text-sm font-medium text-violet-600">Vendors with Outstanding</p>
            <p className="text-2xl font-bold text-violet-700 mt-1">{data.summary?.vendorsWithOutstanding || 0}</p>
          </div>
        </div>

        {/* Vendor Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                    POs
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                    Paid
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">
                    Outstanding
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.vendors?.map((vendor) => (
                  <tr key={vendor.vendorId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{vendor.vendorName}</div>
                      <div className="text-sm text-slate-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                          vendor.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${vendor.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right font-medium">
                      {vendor.totalPurchaseOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 text-right">
                      ₹{vendor.totalPOAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 text-right font-medium">
                      ₹{vendor.totalPaidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                      <span className={`px-2.5 py-1 rounded-lg ${vendor.outstandingAmount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        ₹{vendor.outstandingAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAgingReport = () => {
    if (!data) return null;

    const bucketColors = [
      'bg-green-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
    ];

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Outstanding</p>
            <p className="text-2xl font-bold text-orange-600">
              ₹{(data.summary?.totalOutstanding || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total POs with Outstanding</p>
            <p className="text-2xl font-bold text-blue-600">{data.summary?.totalPOs || 0}</p>
          </div>
        </div>

        {/* Aging Buckets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.agingBuckets?.map((bucket, index) => (
            <div key={bucket.label} className="bg-white rounded-lg shadow-md p-4">
              <div className={`w-full h-2 rounded-full mb-3 ${bucketColors[index]}`}></div>
              <p className="text-sm font-medium text-gray-600">{bucket.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ₹{bucket.amount.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-gray-500">{bucket.count} POs</p>
            </div>
          ))}
        </div>

        {/* Detailed Table */}
        {data.agingBuckets?.some(b => b.pos?.length > 0) && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Overdue Purchase Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      PO Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Days Overdue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Outstanding
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.agingBuckets?.flatMap((bucket, bucketIndex) =>
                    bucket.pos?.map((po) => (
                      <tr key={po.poNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                          {po.poNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {po.vendorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(po.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={`font-medium ${bucketColors[bucketIndex].replace('bg-', 'text-').replace('500', '600')}`}>
                            {po.daysOverdue}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600 text-right">
                          ₹{po.outstanding.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTrendsReport = () => {
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Payments (6 months)</p>
            <p className="text-2xl font-bold text-green-600">
              ₹{(data.summary?.totalPayments || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-blue-600">{data.summary?.totalTransactions || 0}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Avg Monthly Payment</p>
            <p className="text-2xl font-bold text-purple-600">
              ₹{(data.summary?.averageMonthly || 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Monthly Trends Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Payment Trends</h3>
          </div>
          {data.trends?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No payment data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Month
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Avg Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment Methods
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.trends?.map((trend) => (
                    <tr key={trend.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {trend.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {trend.paymentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                        ₹{trend.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ₹{trend.averagePayment.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Object.entries(trend.byMethod || {})
                          .map(([method, amount]) => `${method}: ₹${amount.toLocaleString('en-IN')}`)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics & Reports</h1>
        <p className="text-slate-500 mt-1">View detailed financial reports and payment analytics</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'outstanding' && renderOutstandingReport()}
              {activeTab === 'aging' && renderAgingReport()}
              {activeTab === 'trends' && renderTrendsReport()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
