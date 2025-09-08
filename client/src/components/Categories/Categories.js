import React, { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import CategoryModal from './CategoryModal';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleCategorySaved = () => {
    setShowModal(false);
    fetchCategories();
    toast.success('Category saved successfully');
  };

  const handleCategoryClick = (category) => {
    // Navigate to products page filtering by clicked category ID
    navigate(`/products?category=${category._id}`);
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your products into logical groups</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleAddCategory}
            className="btn btn-primary"
          >
            <HiPlus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category._id}
            className="card cursor-pointer"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span
                      className="text-lg font-semibold"
                      style={{ color: category.color }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Category"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category._id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete Category"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {category.parentCategory && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Parent: {category.parentCategory.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <HiPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first product category
          </p>
          <button
            onClick={handleAddCategory}
            className="btn btn-primary"
          >
            <HiPlus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => setShowModal(false)}
          onSaved={handleCategorySaved}
        />
      )}
    </div>
  );
};

export default Categories;
