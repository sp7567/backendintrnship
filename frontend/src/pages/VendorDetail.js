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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vendor not found</p>
        <Link to="/vendors" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
          ← Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/vendors" className="text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.vendorName}</h1>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              vendor.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {vendor.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Contact Person</dt>
              <dd className="text-sm font-medium text-gray-900">{vendor.contactPerson || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{vendor.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium text-gray-900">{vendor.phoneNumber || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Payment Terms</dt>
              <dd className="text-sm font-medium text-gray-900">
                {paymentTermsLabel(vendor.paymentTerms)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total POs</p>
              <p className="text-2xl font-bold text-blue-600">
                {vendor.paymentSummary?.totalPurchaseOrders || 0}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{(vendor.paymentSummary?.totalPOAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{(vendor.paymentSummary?.totalPaidAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{(vendor.paymentSummary?.outstandingAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Purchase Orders</h2>
        </div>
        {vendor.purchaseOrders?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No purchase orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PO Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendor.purchaseOrders?.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/purchase-orders/${po.id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {po.poNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(po.poDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          po.status === 'FullyPaid'
                            ? 'bg-green-100 text-green-800'
                            : po.status === 'PartiallyPaid'
                            ? 'bg-yellow-100 text-yellow-800'
                            : po.status === 'Approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
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
