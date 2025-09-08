import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiX } from 'react-icons/hi';
import axios from 'axios';

const SupplierModal = ({ supplier, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const isEditing = Boolean(supplier);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (supplier) {
      Object.keys(supplier).forEach(key => {
        if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
          setValue(key, supplier[key]);
        }
      });
    }
  }, [supplier, setValue]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`/api/suppliers/${supplier._id}`, data);
      } else {
        await axios.post('/api/suppliers', data);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Supplier Name *</label>
              <input {...register('name', { required: 'Supplier name is required' })} className="input" placeholder="Enter supplier name" />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Supplier Code *</label>
              <input {...register('code', { required: 'Supplier code is required' })} className="input" placeholder="Enter supplier code" />
              {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <fieldset className="border rounded-md p-4">
            <legend className="text-gray-700 font-semibold mb-3">Contact Person</legend>
            <div className="grid md:grid-cols-2 gap-6">
              <input {...register('contactPerson.name')} placeholder="Name" className="input" />
              <input {...register('contactPerson.position')} placeholder="Position" className="input" />
              <input type="email" {...register('contactPerson.email')} placeholder="Email" className="input" />
              <input {...register('contactPerson.phone')} placeholder="Phone" className="input" />
            </div>
          </fieldset>

          <fieldset className="border rounded-md p-4">
            <legend className="text-gray-700 font-semibold mb-3">Address</legend>
            <div className="grid md:grid-cols-2 gap-6">
              <input {...register('address.street')} placeholder="Street" className="input md:col-span-2" />
              <input {...register('address.city')} placeholder="City" className="input" />
              <input {...register('address.state')} placeholder="State" className="input" />
              <input {...register('address.zipCode')} placeholder="ZIP Code" className="input" />
              <input {...register('address.country')} placeholder="Country" className="input" />
            </div>
          </fieldset>

          <div className="grid md:grid-cols-2 gap-6">
            <input {...register('phone')} placeholder="Main Phone" className="input" />
            <input type="email" {...register('email')} placeholder="Main Email" className="input" />
          </div>

          <input type="url" {...register('website')} placeholder="Website URL" className="input" />

          <div className="grid md:grid-cols-2 gap-6">
            <input type="number" {...register('taxId')} placeholder="Tax ID" className="input" />
            <select {...register('paymentTerms')} className="input">
              <option value="net30">Net 30</option>
              <option value="net60">Net 60</option>
              <option value="net90">Net 90</option>
              <option value="immediate">Immediate</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <input type="number" step="0.01" {...register('creditLimit', { min: 0 })} placeholder="Credit Limit" className="input" />
            <select {...register('rating')} className="input">
              <option value="">Select Rating</option>
              {[1,2,3,4,5].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Categories</label>
            <select {...register('categories')} multiple className="input">
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <small className="text-gray-500">Hold Ctrl (Cmd on Mac) to select multiple</small>
          </div>

          <textarea {...register('notes')} placeholder="Additional notes" rows={3} className="input" />

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update Supplier' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierModal;
