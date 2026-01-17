import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await api.delete(`/payments/${id}`);
        toast.success('Payment deleted successfully');
        fetchPayments();
      } catch (error) {
        toast.error('Failed to delete payment');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentMethodBadge = (method) => {
    const styles = {
      BANK_TRANSFER: 'bg-blue-100 text-blue-700 border-blue-200',
      CASH: 'bg-green-100 text-green-700 border-green-200',
      CHEQUE: 'bg-purple-100 text-purple-700 border-purple-200',
      UPI: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return `${styles[method] || 'bg-gray-100 text-gray-700 border-gray-200'} border`;
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'BANK_TRANSFER':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case 'CASH':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'CHEQUE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'UPI':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.purchaseOrder?.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.purchaseOrder?.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === '' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const methodTotals = filteredPayments.reduce((acc, p) => {
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">Track all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Total Payments</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
          <p className="text-blue-200 text-xs mt-2">{filteredPayments.length} transactions</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            {getMethodIcon('BANK_TRANSFER')}
            <span className="text-sm font-medium">Bank Transfer</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(methodTotals.BANK_TRANSFER || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            {getMethodIcon('CASH')}
            <span className="text-sm font-medium">Cash</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(methodTotals.CASH || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            {getMethodIcon('CHEQUE')}
            <span className="text-sm font-medium">Cheque</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(methodTotals.CHEQUE || 0)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2 text-orange-600 mb-2">
            {getMethodIcon('UPI')}
            <span className="text-sm font-medium">UPI</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(methodTotals.UPI || 0)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">All Methods</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
          <option value="CHEQUE">Cheque</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Purchase Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {payment.referenceNumber && (
                        <p className="text-sm text-gray-500">Ref: {payment.referenceNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/purchase-orders/${payment.purchaseOrder?.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {payment.purchaseOrder?.poNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {payment.purchaseOrder?.vendor?.name?.charAt(0) || 'V'}
                      </div>
                      <span className="text-gray-900">{payment.purchaseOrder?.vendor?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(payment.paymentMethod)}`}>
                      {payment.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600 text-lg">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500">Record payments from purchase order details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
