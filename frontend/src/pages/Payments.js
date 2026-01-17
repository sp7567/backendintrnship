import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentsAPI, purchaseOrdersAPI } from '../services/api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    purchaseOrderId: '',
    amountPaid: '',
    paymentMethod: 'NEFT',
    notes: '',
  });
  const [filter, setFilter] = useState({ paymentMethod: '' });
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchPurchaseOrders();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.paymentMethod) params.paymentMethod = filter.paymentMethod;
      
      const response = await paymentsAPI.getAll(params);
      setPayments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await purchaseOrdersAPI.getAll({ status: ['Approved', 'PartiallyPaid'] });
      setPurchaseOrders(response.data.data.filter(po => po.outstandingAmount > 0));
    } catch (error) {
      console.error('Failed to fetch POs');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.create({
        ...formData,
        amountPaid: parseFloat(formData.amountPaid),
      });
      toast.success('Payment recorded successfully');
      setShowModal(false);
      resetForm();
      fetchPayments();
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleVoid = async (id) => {
    if (window.confirm('Are you sure you want to void this payment?')) {
      try {
        await paymentsAPI.void(id);
        toast.success('Payment voided successfully');
        fetchPayments();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Void failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      purchaseOrderId: '',
      amountPaid: '',
      paymentMethod: 'NEFT',
      notes: '',
    });
    setSelectedPO(null);
  };

  const handlePOSelect = (poId) => {
    const po = purchaseOrders.find(p => p.id === poId);
    setSelectedPO(po);
    setFormData({ ...formData, purchaseOrderId: poId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track and manage payment records</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Record Payment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-5">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.paymentMethod}
            onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
            className="px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer min-w-[180px]"
          >
            <option value="">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="NEFT">NEFT</option>
            <option value="RTGS">RTGS</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-gray-500 text-lg">No payments found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Record Payment" to create one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Reference
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    PO Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Vendor
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
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className={`hover:bg-blue-50/50 transition-colors duration-150 ${payment.isVoided ? 'bg-red-50/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {payment.referenceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/purchase-orders/${payment.purchaseOrder?.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        {payment.purchaseOrder?.poNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.purchaseOrder?.vendor?.vendorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      ₹{parseFloat(payment.amountPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.isVoided ? (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200">
                          Voided
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200">
                          Valid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {!payment.isVoided && (
                        <button
                          onClick={() => handleVoid(payment.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Void
                        </button>
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
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Record Payment
                </h2>
              </div>
              <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Purchase Order *</label>
                  <select
                    required
                    value={formData.purchaseOrderId}
                    onChange={(e) => handlePOSelect(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="">Select a PO</option>
                    {purchaseOrders.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.poNumber} - {po.vendor?.vendorName} (Outstanding: ₹{po.outstandingAmount?.toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPO && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-gray-700">
                      Outstanding Amount: <span className="font-bold text-amber-600 text-lg">₹{selectedPO.outstandingAmount?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    max={selectedPO?.outstandingAmount}
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 resize-none"
                    placeholder="Optional notes"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-300"
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

export default Payments;
