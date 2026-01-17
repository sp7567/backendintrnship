import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { purchaseOrdersAPI, vendorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    status: 'Draft',
  });
  const [filter, setFilter] = useState({ vendorId: '', status: '', search: '' });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
  }, [filter]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.vendorId) params.vendorId = filter.vendorId;
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;
      
      const response = await purchaseOrdersAPI.getAll(params);
      setPurchaseOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll({ status: 'Active' });
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendors');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchaseOrdersAPI.create(formData);
      toast.success('Purchase Order created successfully');
      setShowModal(false);
      resetForm();
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await purchaseOrdersAPI.updateStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const resetForm = () => {
    setFormData({
      vendorId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      status: 'Draft',
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const statusColors = {
    Draft: 'bg-gray-100 text-gray-700 border border-gray-200',
    Approved: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border border-blue-200',
    PartiallyPaid: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200',
    FullyPaid: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Manage your purchase orders</p>
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
          Create PO
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-5">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search PO number..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all duration-300"
            />
          </div>
          <select
            value={filter.vendorId}
            onChange={(e) => setFilter({ ...filter, vendorId: e.target.value })}
            className="px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer min-w-[180px]"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.vendorName}
              </option>
            ))}
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer min-w-[160px]"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="PartiallyPaid">Partially Paid</option>
            <option value="FullyPaid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No purchase orders found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Create PO" to create one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    PO Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-50">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/purchase-orders/${po.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        {po.poNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {po.vendor?.vendorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(po.poDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${po.outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        ₹{(po.outstandingAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${statusColors[po.status]}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {po.status === 'Draft' && (
                        <button
                          onClick={() => handleUpdateStatus(po.id, 'Approved')}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors mr-2"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                      )}
                      <Link
                        to={`/purchase-orders/${po.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Purchase Order
                </h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor *</label>
                  <select
                    required
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-semibold text-gray-700">Items *</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-blue-100 rounded-lg bg-white text-sm focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            required
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-blue-100 rounded-lg bg-white text-sm focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="w-full px-3 py-2.5 border-2 border-blue-100 rounded-lg bg-white text-sm focus:border-blue-500 transition-all"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-700">₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
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
                    Create Purchase Order
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

export default PurchaseOrders;
