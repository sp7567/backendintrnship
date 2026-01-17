import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { purchaseOrdersAPI, paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: '',
    paymentMethod: 'NEFT',
    notes: '',
  });

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await purchaseOrdersAPI.getById(id);
      setPo(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.create({
        purchaseOrderId: id,
        ...paymentForm,
        amountPaid: parseFloat(paymentForm.amountPaid),
      });
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setPaymentForm({ amountPaid: '', paymentMethod: 'NEFT', notes: '' });
      fetchPurchaseOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await purchaseOrdersAPI.updateStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchPurchaseOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const statusColors = {
    Draft: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200',
    Approved: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200',
    PartiallyPaid: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200',
    FullyPaid: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200',
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

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Purchase Order not found</p>
        <Link to="/purchase-orders" className="text-blue-600 hover:text-blue-800 mt-4 inline-block font-semibold">
          ← Back to Purchase Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/purchase-orders" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{po.poNumber}</h1>
          <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${statusColors[po.status]}`}>
            {po.status}
          </span>
        </div>
        <div className="flex space-x-3">
          {po.status === 'Draft' && (
            <button
              onClick={() => handleUpdateStatus('Approved')}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approve PO
            </button>
          )}
          {(po.status === 'Approved' || po.status === 'PartiallyPaid') && po.outstandingAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all font-semibold shadow-lg shadow-emerald-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Record Payment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO Info */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Order Details
          </h2>
          <dl className="space-y-4">
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">
                <Link to={`/vendors/${po.vendor?.id}`} className="text-blue-600 hover:text-blue-800">
                  {po.vendor?.vendorName}
                </Link>
              </dd>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PO Date</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(po.poDate).toLocaleDateString()}
              </dd>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(po.dueDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Financial Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Financial Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
              <p className="text-sm font-semibold text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-5 border border-emerald-200">
              <p className="text-sm font-semibold text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{(po.totalPaid || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-5 border border-amber-200">
              <p className="text-sm font-semibold text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                ₹{(po.outstandingAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Line Items
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {po.items?.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    ₹{parseFloat(item.unitPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                    ₹{(item.quantity * parseFloat(item.unitPrice)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  Total
                </td>
                <td className="px-6 py-4 text-lg font-bold text-blue-700 text-right">
                  ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment History
          </h2>
        </div>
        {po.paymentHistory?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No payments recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {po.paymentHistory?.map((payment) => (
                  <tr key={payment.id} className={`transition-colors ${payment.isVoided ? 'bg-red-50/50' : 'hover:bg-blue-50/50'}`}>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payment.referenceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">
                      ₹{parseFloat(payment.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {payment.isVoided ? (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200">
                          Voided
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200">
                          Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Record Payment
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-gray-600 flex items-center justify-between">
                    <span className="font-semibold">Outstanding Amount:</span>
                    <span className="font-bold text-amber-600 text-lg">₹{(po.outstandingAmount || 0).toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      max={po.outstandingAmount}
                      step="0.01"
                      value={paymentForm.amountPaid}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT">NEFT</option>
                      <option value="RTGS">RTGS</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Optional notes"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25"
                    >
                      Record Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderDetail;
