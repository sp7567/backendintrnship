import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'BANK_TRANSFER',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await api.get(`/purchase-orders/${id}`);
      setPurchaseOrder(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase order');
      navigate('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        purchaseOrderId: id,
        ...paymentData,
        amount: parseFloat(paymentData.amount),
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentData({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        notes: '',
      });
      fetchPurchaseOrder();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record payment');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await api.delete(`/payments/${paymentId}`);
        toast.success('Payment deleted successfully');
        fetchPurchaseOrder();
      } catch (error) {
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.patch(`/purchase-orders/${id}`, { status: 'CANCELLED' });
        toast.success('Order cancelled successfully');
        fetchPurchaseOrder();
      } catch (error) {
        toast.error('Failed to cancel order');
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

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      PARTIALLY_PAID: 'bg-blue-100 text-blue-700 border-blue-200',
      PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return `${styles[status] || styles.PENDING} border`;
  };

  const getPaymentMethodBadge = (method) => {
    const styles = {
      BANK_TRANSFER: 'bg-blue-100 text-blue-700',
      CASH: 'bg-green-100 text-green-700',
      CHEQUE: 'bg-purple-100 text-purple-700',
      UPI: 'bg-orange-100 text-orange-700',
    };
    return styles[method] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return null;
  }

  const outstandingAmount = purchaseOrder.totalAmount - purchaseOrder.paidAmount;
  const paymentPercentage = (purchaseOrder.paidAmount / purchaseOrder.totalAmount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link
            to="/purchase-orders"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{purchaseOrder.poNumber}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(purchaseOrder.status)}`}>
                {purchaseOrder.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              Created on {new Date(purchaseOrder.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {purchaseOrder.status !== 'PAID' && purchaseOrder.status !== 'CANCELLED' && (
            <>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Record Payment
              </button>
              <button
                onClick={handleCancelOrder}
                className="inline-flex items-center px-5 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancel Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {purchaseOrder.vendor?.name?.charAt(0) || 'V'}
              </div>
              <div className="flex-1">
                <Link
                  to={`/vendors/${purchaseOrder.vendor?.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {purchaseOrder.vendor?.name}
                </Link>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  {purchaseOrder.vendor?.email && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {purchaseOrder.vendor.email}
                    </p>
                  )}
                  {purchaseOrder.vendor?.phone && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {purchaseOrder.vendor.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Unit Price</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {purchaseOrder.items?.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-right font-semibold text-gray-700">Total Amount</td>
                    <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">{formatCurrency(purchaseOrder.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              <span className="text-sm text-gray-500">{purchaseOrder.payments?.length || 0} payments</span>
            </div>
            {purchaseOrder.payments?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {purchaseOrder.payments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                          {payment.referenceNumber && ` • Ref: ${payment.referenceNumber}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(payment.paymentMethod)}`}>
                        {payment.paymentMethod.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-gray-500">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Payment Progress</span>
                <span className="font-semibold text-gray-900">{Math.round(paymentPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold text-gray-900">{formatCurrency(purchaseOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(purchaseOrder.paidAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-bold text-xl text-amber-600">{formatCurrency(outstandingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Order Date</span>
                <span className="font-medium text-gray-900">{new Date(purchaseOrder.orderDate).toLocaleDateString('en-IN')}</span>
              </div>
              {purchaseOrder.expectedDeliveryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Expected Delivery</span>
                  <span className="font-medium text-gray-900">{new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Items Count</span>
                <span className="font-medium text-gray-900">{purchaseOrder.items?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="p-6">
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700">
                    Outstanding: <span className="font-bold">{formatCurrency(outstandingAmount)}</span>
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={outstandingAmount}
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                    <input
                      type="date"
                      value={paymentData.paymentDate}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                    <input
                      type="text"
                      value={paymentData.referenceNumber}
                      onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Transaction ID, Cheque No., etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetail;
