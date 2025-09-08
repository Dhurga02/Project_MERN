import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiStar } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import SupplierModal from './SupplierModal';
import LoadingSpinner from '../UI/LoadingSpinner';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await axios.delete(`/api/suppliers/${supplierId}`);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error) {
        toast.error('Failed to delete supplier');
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handleSupplierSaved = () => {
    setShowModal(false);
    fetchSuppliers();
    toast.success('Supplier saved successfully');
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <HiStar
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
          );
    }
    return stars;
  };

  const getPerformanceBadge = (rating) => {
    if (rating >= 4) return 'badge-success';
    if (rating >= 3) return 'badge-warning';
    return 'badge-danger';
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your vendor relationships</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddSupplier}
            className="btn btn-primary"
          >
            <HiPlus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
        </div>
      </div>

 {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier._id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{supplier.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{supplier.code}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditSupplier(supplier)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Supplier"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(supplier._id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Supplier"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              {supplier.contactPerson?.name && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact:</span> {supplier.contactPerson.name}
                      </p>
                  {supplier.contactPerson.email && (
                    <p className="text-sm text-gray-500">{supplier.contactPerson.email}</p>
                  )}
                  {supplier.contactPerson.phone && (
                    <p className="text-sm text-gray-500">{supplier.contactPerson.phone}</p>
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="mb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {getRatingStars(supplier.rating || 0)}
                  </div>
                  <span className={`badge ${getPerformanceBadge(supplier.rating || 0)}`}>
                    {supplier.performance || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Terms:</span> {supplier.paymentTerms}
                </p>
                {supplier.creditLimit && (
                  <p className="text-sm text-gray-500">
                    Credit Limit: ${supplier.creditLimit.toLocaleString()}
                  </p>
                )}
              </div>

               {/* Categories */}
              {supplier.categories && supplier.categories.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Categories:</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {supplier.notes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {supplier.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {suppliers.length === 0 && (
         <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first supplier
          </p>
          <button
            onClick={handleAddSupplier}
            className="btn btn-primary"
          >
            <HiPlus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setShowModal(false)}
          onSaved={handleSupplierSaved}
        />
      )}
    </div>
  );
};

export default Suppliers;