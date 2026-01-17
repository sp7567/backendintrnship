import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { vendorsAPI } from '../services/api';
import toast from 'react-hot-toast';

const VendorDetail = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await vendorsAPI.getById(id);
      setVendor(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch vendor details');
    } finally {
      setLoading(false);
    }
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

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor not found</p>
        <Link to="/vendors" className="text-blue-600 hover:text-blue-800 mt-4 inline-block font-semibold">
          ← Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/vendors" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{vendor.vendorName}</h1>
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
              vendor.status === 'Active'
                ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
            }`}
          >
            {vendor.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Info */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Vendor Information
          </h2>
          <dl className="space-y-4">
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Person</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">{vendor.contactPerson || '-'}</dd>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">{vendor.email}</dd>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">{vendor.phoneNumber || '-'}</dd>
            </div>
            <div className="p-3 bg-blue-50/50 rounded-xl">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Terms</dt>
              <dd className="text-sm font-semibold text-gray-900 mt-1">
                {paymentTermsLabel(vendor.paymentTerms)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Payment Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-semibold text-gray-600">Total POs</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {vendor.paymentSummary?.totalPurchaseOrders || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
              <p className="text-sm font-semibold text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                ₹{(vendor.paymentSummary?.totalPOAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm font-semibold text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                ₹{(vendor.paymentSummary?.totalPaidAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200">
              <p className="text-sm font-semibold text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                ₹{(vendor.paymentSummary?.outstandingAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-blue-100/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Purchase Orders
          </h2>
        </div>
        {vendor.purchaseOrders?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No purchase orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    PO Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {vendor.purchaseOrders?.map((po) => (
                  <tr key={po.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/purchase-orders/${po.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        {po.poNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(po.poDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                          po.status === 'FullyPaid'
                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                            : po.status === 'PartiallyPaid'
                            ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200'
                            : po.status === 'Approved'
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200'
                            : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {po.status}
                      </span>
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

export default VendorDetail;
