import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { HiX } from 'react-icons/hi';
import axios from 'axios';

const CategoryModal = ({ category, onClose, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm();

  const isEditing = !!category;

  // useCallback to avoid unnecessary refetches and fix ESLint warning
  const fetchParentCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/categories');
      const filtered = isEditing
        ? response.data.filter((c) => c._id !== category._id)
        : response.data;
      setParentCategories(filtered);
    } catch (error) {
      console.error('Error fetching parent categories:', error);
    }
  }, [isEditing, category?._id]);

  useEffect(() => {
    fetchParentCategories();
    if (category) {
      Object.keys(category).forEach((key) => {
        if (
          key !== '_id' &&
          key !== '__v' &&
          key !== 'createdAt' &&
          key !== 'updatedAt'
        ) {
          setValue(key, category[key]);
        }
      });
    }
  }, [category, setValue, fetchParentCategories]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await axios.put(`/api/categories/${category._id}`, data);
      } else {
        await axios.post('/api/categories', data);
      }
      onSaved();
    } catch (error) {
      const message =
        error.response?.data?.msg || 'Failed to save category';
      console.error('Error saving category:', message);
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const iconOptions = [
    'box', 'cube', 'tag', 'folder', 'archive', 'package',
    'gift', 'shopping-bag', 'truck', 'warehouse'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Category name is required' })}
              className="mt-1 input"
              placeholder="Enter category name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 input"
              placeholder="Enter category description"
            />
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              {...register('parentCategory')}
              className="mt-1 input"
            >
              <option value="">No parent category</option>
              {parentCategories.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <label key={color} className="flex items-center">
                  <input
                    type="radio"
                    {...register('color')}
                    value={color}
                    className="sr-only"
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                      watch('color') === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <select
              {...register('icon')}
              className="mt-1 input"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon.charAt(0).toUpperCase() + icon.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
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
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
