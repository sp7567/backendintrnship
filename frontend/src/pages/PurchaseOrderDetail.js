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
    Draft: 'bg-gray-100 text-gray-800',
    Approved: 'bg-blue-100 text-blue-800',
    PartiallyPaid: 'bg-yellow-100 text-yellow-800',
    FullyPaid: 'bg-green-100 text-green-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Purchase Order not found</p>
        <Link to="/purchase-orders" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
          ← Back to Purchase Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/purchase-orders" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{po.poNumber}</h1>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[po.status]}`}>
            {po.status}
          </span>
        </div>
        <div className="flex space-x-3">
          {po.status === 'Draft' && (
            <button
              onClick={() => handleUpdateStatus('Approved')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Approve PO
            </button>
          )}
          {(po.status === 'Approved' || po.status === 'PartiallyPaid') && po.outstandingAmount > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PO Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Vendor</dt>
              <dd className="text-sm font-medium text-gray-900">
                <Link to={`/vendors/${po.vendor?.id}`} className="text-primary-600 hover:text-primary-800">
                  {po.vendor?.vendorName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">PO Date</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(po.poDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Due Date</dt>
              <dd className="text-sm font-medium text-gray-900">
                {new Date(po.dueDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Financial Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{(po.totalPaid || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{(po.outstandingAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {po.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    ₹{parseFloat(item.unitPrice).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    ₹{(item.quantity * parseFloat(item.unitPrice)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="3" className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        {po.paymentHistory?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No payments recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {po.paymentHistory?.map((payment) => (
                  <tr key={payment.id} className={payment.isVoided ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.referenceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      ₹{parseFloat(payment.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {payment.isVoided ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Voided
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowPaymentModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Payment</h2>
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Outstanding Amount: <span className="font-bold text-orange-600">₹{(po.outstandingAmount || 0).toLocaleString('en-IN')}</span>
                </p>
              </div>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    max={po.outstandingAmount}
                    step="0.01"
                    value={paymentForm.amountPaid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional notes"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
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
