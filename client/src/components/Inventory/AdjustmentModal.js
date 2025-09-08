import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiX } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdjustmentModal = ({ products, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const selectedProductId = watch('product');
  const selectedProduct = products.find(p => p._id === selectedProductId);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post('/api/inventory/adjustment', data);
      toast.success('Stock adjusted successfully');
      onSaved();
    } catch (error) {
      const message = error.response?.data?.msg || 'Failed to adjust stock';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
       <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-medium text-gray-900">Stock Adjustment</h3>
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
                   <span className="text-gray-500">Min Stock Level:</span>
                   <p className="font-medium">{selectedProduct.minStockLevel} {selectedProduct.unit}</p>
                 </div>
                 <div>
                   <span className="text-gray-500">Max Stock Level:</span>
                   <p className="font-medium">{selectedProduct.maxStockLevel || 'N/A'} {selectedProduct.unit}</p>
                 </div>
               </div>
             </div>
           )}

           <div>
             <label className="block text-sm font-medium text-gray-700">New Stock Quantity *</label>
             <input
               type="number"
               step="0.01"
               {...register('quantity', { 
                 required: 'Quantity is required',
                 min: { value: 0, message: 'Quantity cannot be negative' }
               })}
               className="mt-1 input"
               placeholder="Enter new stock quantity"
             />
              {errors.quantity && (
               <p className="mt-1 text-sm text-danger-600">{errors.quantity.message}</p>
             )}
             {selectedProduct && (
               <p className="mt-1 text-xs text-gray-500">
                 Current: {selectedProduct.currentStock} {selectedProduct.unit} | 
                 New: {watch('quantity') || 0} {selectedProduct.unit} | 
                 Difference: {((watch('quantity') || 0) - selectedProduct.currentStock).toFixed(2)} {selectedProduct.unit}
               </p>
             )}
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700">Reason *</label>
             <select
               {...register('reason', { required: 'Reason is required' })}
               className="mt-1 input"
             >
               <option value="">Select reason</option>
               <option value="inventory_count">Inventory Count</option>
               <option value="damage">Damage</option>
               <option value="expiry">Expiry</option>
               <option value="theft">Theft</option>
               <option value="found">Found</option>
               <option value="correction">Correction</option>
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
               placeholder="Explain why this adjustment is necessary..."
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
               className="btn btn-info"
             >
               {loading ? 'Adjusting Stock...' : 'Adjust Stock'}
             </button>
           </div>
         </form>
       </div>
     </div>
  );
};

export default AdjustmentModal;
