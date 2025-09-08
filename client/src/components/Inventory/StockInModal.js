import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiX } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

const StockInModal = ({ products, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const selectedProductId = watch('product');
  const selectedProduct = products.find(p => p._id === selectedProductId);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/inventory/stock-in', data);
      toast.success('Stock added successfully');
      onSaved();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to add stock';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Stock</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product *</label>
            <select
              {...register('product', { required: 'Product is required' })}
              className="mt-1 input"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - {product.sku} (Current: {product.currentStock} {product.unit})
                </option>
              ))}
            </select>
            {errors.product && (
              <p className="mt-1 text-sm text-danger-600">{errors.product.message}</p>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Product Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Stock:</span>
                  <p className="font-medium">{selectedProduct.currentStock} {selectedProduct.unit}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unit:</span>
                  <p className="font-medium capitalize">{selectedProduct.unit}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cost Price:</span>
                  <p className="font-medium">${selectedProduct.costPrice}</p>
                </div>
                <div>
                  <span className="text-gray-500">Selling Price:</span>
                  <p className="font-medium">${selectedProduct.sellingPrice}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity *</label>
              <input
                type="number"
                step="0.01"
                {...register('quantity', { 
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be positive' }
                })}
                className="mt-1 input"
                placeholder="Enter quantity"
                  />
              {errors.quantity && (
                <p className="mt-1 text-sm text-danger-600">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Unit Price *</label>
              <input
                type="number"
                step="0.01"
                {...register('unitPrice', { 
                  required: 'Unit price is required',
                  min: { value: 0, message: 'Unit price must be positive' }
                })}
                className="mt-1 input"
                placeholder="Enter unit price"
                defaultValue={selectedProduct?.costPrice || ''}
              />
              {errors.unitPrice && (
                <p className="mt-1 text-sm text-danger-600">{errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference</label>
              <input
                type="text"
                {...register('reference')}
                className="mt-1 input"
                placeholder="e.g., Purchase Order, Invoice"
                  />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                type="text"
                {...register('referenceNumber')}
                className="mt-1 input"
                placeholder="e.g., PO-001, INV-2023-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <input
                type="text"
                {...register('location.warehouse')}
                className="input"
                placeholder="Warehouse"
              />
              <input
                type="text"
                {...register('location.aisle')}
                className="input"
                placeholder="Aisle"
              />
              <input
                type="text"
                {...register('location.shelf')}
                className="input"
                placeholder="Shelf"
                  />
              <input
                type="text"
                {...register('location.bin')}
                className="input"
                placeholder="Bin"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason *</label>
            <select
              {...register('reason', { required: 'Reason is required' })}
              className="mt-1 input"
            >
              <option value="">Select reason</option>
              <option value="purchase">Purchase</option>
              <option value="return">Return</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
              <option value="other">Other</option>
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-danger-600">{errors.reason.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
               className="mt-1 input"
              placeholder="Additional notes or comments"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-success"
            >
              {loading ? 'Adding Stock...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
