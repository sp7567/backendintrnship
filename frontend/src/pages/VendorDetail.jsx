import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await api.get(`/vendors/${id}`);
      setVendor(response.data);
    } catch (error) {
      toast.error('Failed to fetch vendor details');
      navigate('/vendors');
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

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      PARTIALLY_PAID: 'bg-blue-100 text-blue-700 border-blue-200',
      PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return `${styles[status] || styles.PENDING} border`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  const totalAmount = vendor.purchaseOrders?.reduce((sum, po) => sum + po.totalAmount, 0) || 0;
  const paidAmount = vendor.purchaseOrders?.reduce((sum, po) => sum + po.paidAmount, 0) || 0;
  const outstandingAmount = totalAmount - paidAmount;
  const paymentPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start space-x-4">
          <Link
            to="/vendors"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
              <p className="text-gray-500">{vendor.email || 'No email provided'}</p>
            </div>
          </div>
        </div>
        <Link
          to="/purchase-orders"
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Purchase Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{vendor.purchaseOrders?.length || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Paid Amount</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-500">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(outstandingAmount)}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
          <div className="space-y-4">
            {vendor.phone && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{vendor.phone}</p>
                </div>
              </div>
            )}
            {vendor.address && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{vendor.address}</p>
                </div>
              </div>
            )}
            {vendor.gstNumber && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">GST Number</p>
                  <p className="text-sm font-medium text-gray-900">{vendor.gstNumber}</p>
                </div>
              </div>
            )}
            {vendor.panNumber && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PAN Number</p>
                  <p className="text-sm font-medium text-gray-900">{vendor.panNumber}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bank Details */}
          {(vendor.bankName || vendor.bankAccountNumber) && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Bank Details</h4>
              <div className="space-y-3">
                {vendor.bankName && (
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.bankName}</p>
                  </div>
                )}
                {vendor.bankAccountNumber && (
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.bankAccountNumber}</p>
                  </div>
                )}
                {vendor.bankIfscCode && (
                  <div>
                    <p className="text-xs text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{vendor.bankIfscCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Progress */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Payment Progress</span>
              <span className="text-sm font-semibold text-gray-900">{Math.round(paymentPercentage)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${paymentPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Purchase Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Orders</h3>
            <span className="text-sm text-gray-500">{vendor.purchaseOrders?.length || 0} orders</span>
          </div>
          {vendor.purchaseOrders?.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {vendor.purchaseOrders.map((po) => (
                <Link
                  key={po.id}
                  to={`/purchase-orders/${po.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{po.poNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(po.orderDate).toLocaleDateString('en-IN')} • {po.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(po.totalAmount)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(po.status)}`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No purchase orders yet</h4>
              <p className="text-gray-500 mb-4">Create your first purchase order for this vendor.</p>
              <Link
                to="/purchase-orders"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Create Order
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
