import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchVendors();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPurchaseOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/vendors');
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', formData);
      toast.success('Purchase order created successfully');
      setShowModal(false);
      resetForm();
      fetchPurchaseOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create purchase order');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    setFormData({ ...formData, items: newItems });
  };

  const resetForm = () => {
    setFormData({
      vendorId: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
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

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-500 mt-1">Create and manage purchase orders</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Order
        </button>
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
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PO Number
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/purchase-orders/${po.id}`}
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {po.poNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
                        {po.vendor?.name?.charAt(0) || 'V'}
                      </div>
                      <span className="text-gray-900">{po.vendor?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(po.orderDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrency(po.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-medium">
                    {formatCurrency(po.paidAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(po.status)}`}>
                      {po.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      to={`/purchase-orders/${po.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
            <p className="text-gray-500">Create your first purchase order to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto transform transition-all max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-gray-900">Create Purchase Order</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                    <select
                      value={formData.vendorId}
                      onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                    <input
                      type="date"
                      value={formData.orderDate}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery</label>
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">Order Items</h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Unit Price"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="w-28 text-right">
                          <p className="py-2.5 font-semibold text-gray-900">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700 font-medium">Order Total</span>
                      <span className="text-2xl font-bold text-blue-700">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
                  >
                    Create Order
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

export default PurchaseOrders;
