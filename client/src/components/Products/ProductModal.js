import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { HiX } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductModal = ({ product, categories, suppliers, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      unit: '',
      costPrice: '',
      sellingPrice: '',
      minStockLevel: '',
      maxStockLevel: '',
      barcode: '',
      tags: '',
      category: '',
      supplier: '',
    },
  });

  const isEditing = Boolean(product);

  useEffect(() => {
    reset({
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      unit: product?.unit || '',
      costPrice: product?.costPrice || '',
      sellingPrice: product?.sellingPrice || '',
      minStockLevel: product?.minStockLevel || '',
      maxStockLevel: product?.maxStockLevel || '',
      barcode: product?.barcode || '',
      tags: product?.tags?.join(', ') || '',
      category: product?.category?._id || '',
      supplier: product?.supplier?._id || '',
    });
  }, [product, reset]);

  const generateBarcode = async () => {
    setGeneratingBarcode(true);
    try {
      const response = await axios.get('/api/barcodes/generate/new');
      setValue('barcode', response.data.barcode);
      toast.success('Barcode generated successfully');
    } catch {
      toast.error('Failed to generate barcode');
    } finally {
      setGeneratingBarcode(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      if (isEditing) {
        await axios.put(`/api/products/${product._id}`, payload);
      } else {
        await axios.post('/api/products', payload);
      }
      onSaved();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <HiX className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Product Name + SKU */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Product Name *</label>
              <input
                type="text"
                placeholder="Enter product name"
                className="input mt-1"
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">SKU *</label>
              <input
                type="text"
                placeholder="Enter SKU"
                className="input mt-1"
                {...register("sku", { required: "SKU is required" })}
              />
              {errors.sku && <p className="text-red-600 text-sm">{errors.sku.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              rows={3}
              placeholder="Enter product description"
              className="input mt-1"
              {...register("description")}
            />
          </div>

          {/* Category + Supplier */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Category *</label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <select {...field} className="input mt-1">
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category && <p className="text-red-600 text-sm">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Supplier</label>
              <Controller
  name="supplier"
  control={control}
  render={({ field }) => (
    <select {...field} className="input mt-1">
      <option value="">Select supplier</option>
      <option value="fast-delivery">Fast Delivery</option>   {/* Your extra option */}
      <option value="mega-supply">Mega Supply</option>       {/* Your extra option */}
      {suppliers.map(s => (
        <option key={s._id} value={s._id}>{s.name}</option>
      ))}
    </select>
  )}
/>

            </div>
          </div>

          {/* Unit + Prices */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Unit</label>
              <select className="input mt-1" {...register("unit")}>
                <option value="">Select unit</option>
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="meter">Meter</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="dozen">Dozen</option>
                <option value="pair">Pair</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Cost Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="input mt-1"
                {...register("costPrice", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Selling Price</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="input mt-1"
                {...register("sellingPrice", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Stock Levels */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Minimum Stock Level</label>
              <input
                type="number"
                className="input mt-1"
                {...register("minStockLevel", { valueAsNumber: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Maximum Stock Level</label>
              <input
                type="number"
                className="input mt-1"
                {...register("maxStockLevel", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Barcode + Tags */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Barcode</label>
              <input
                type="text"
                className="input mt-1"
                {...register("barcode")}
              />
              <button
                type="button"
                onClick={generateBarcode}
                className="btn btn-secondary btn-outline mt-3"
              >
                {generatingBarcode ? 'Generating...' : 'Generate'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium">Tags</label>
              <input
                type="text"
                className="input mt-1"
                placeholder="Enter tags separated by commas"
                {...register("tags")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={onClose} type="button" className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? 'Update' : 'Save')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductModal;
