import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vendorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    vendorName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    paymentTerms: 'DAYS_30',
    status: 'Active',
  });
  const [filter, setFilter] = useState({ status: '', search: '' });

  useEffect(() => {
    fetchVendors();
  }, [filter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;
      
      const response = await vendorsAPI.getAll(params);
      setVendors(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorsAPI.update(editingVendor.id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorsAPI.create(formData);
        toast.success('Vendor created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      vendorName: vendor.vendorName,
      contactPerson: vendor.contactPerson || '',
      email: vendor.email,
      phoneNumber: vendor.phoneNumber || '',
      paymentTerms: vendor.paymentTerms,
      status: vendor.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorsAPI.delete(id);
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vendorName: '',
      contactPerson: '',
      email: '',
      phoneNumber: '',
      paymentTerms: 'DAYS_30',
      status: 'Active',
    });
    setEditingVendor(null);
  };

  const paymentTermsLabel = (terms) => {
    const labels = {
      DAYS_7: '7 Days',
      DAYS_15: '15 Days',
      DAYS_30: '30 Days',
      DAYS_45: '45 Days',
      DAYS_60: '60 Days',
    };
    return labels[terms] || terms;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Manage your vendor relationships</p>
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
          Add Vendor
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
              placeholder="Search vendors..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:bg-white transition-all duration-300"
            />
          </div>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-blue-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 text-lg">No vendors found</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Vendor" to create one</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                    Payment Terms
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
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/vendors/${vendor.id}`} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                        {vendor.vendorName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.contactPerson || '-'}</div>
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg">
                        {paymentTermsLabel(vendor.paymentTerms)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                          vendor.status === 'Active'
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors mr-2"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
              </div>
              <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="DAYS_7">7 Days</option>
                    <option value="DAYS_15">15 Days</option>
                    <option value="DAYS_30">30 Days</option>
                    <option value="DAYS_45">45 Days</option>
                    <option value="DAYS_60">60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl bg-blue-50/50 text-gray-800 focus:border-blue-500 focus:bg-white transition-all duration-300 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
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
                    {editingVendor ? 'Update Vendor' : 'Create Vendor'}
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

export default Vendors;
