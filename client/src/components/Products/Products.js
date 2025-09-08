import React, { useState, useEffect } from 'react';
import { HiPlus, HiQrcode, HiPencil, HiTrash, HiEye } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductModal from './ProductModal';
import ProductDetailModal from './ProductDetailModal';
import BarcodeScanner from './BarcodeScanner';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useLocation } from 'react-router-dom';

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10,
          search: searchTerm,
        });
        if (categoryFilter) {
          params.append('category', categoryFilter);
        }
        const response = await axios.get(`/api/products?${params.toString()}`);
        setProducts(response.data.products ?? []);
        setTotalPages(response.data.totalPages ?? 1);
      } catch (error) {
        toast.error('Failed to fetch products');
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get('/api/categories');
        setCategories(response.data ?? []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const response = await axios.get('/api/suppliers');
        setSuppliers(response.data ?? []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchCategories();
    fetchSuppliers();
  }, []);

  const isLoadingDropdownData = loadingCategories || loadingSuppliers;

  const handleAddProduct = () => {
    if (!isLoadingDropdownData) {
      setSelectedProduct(null);
      setShowModal(true);
    } else {
      toast('Please wait, loading categories and suppliers...');
    }
  };

  const handleEditProduct = (product) => {
    if (!isLoadingDropdownData) {
      setSelectedProduct(product ?? {});
      setShowModal(true);
    } else {
      toast('Please wait, loading categories and suppliers...');
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product ?? {});
    setShowDetailModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        toast.success('Product deleted successfully');
        setCurrentPage(1);
      } catch (error) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleProductSaved = () => {
    setShowModal(false);
    setCurrentPage(1); // refresh to first page or your preference
    toast.success('Product saved successfully');
  };

  const handleBarcodeScan = async (barcode) => {
    try {
      const response = await axios.post('/api/barcodes/scan', { barcode });
      setSelectedProduct(response.data ?? {});
      setShowDetailModal(true);
      setShowScanner(false);
      toast.success('Product found!');
    } catch (error) {
      toast.error('Product not found');
      console.error('Error scanning barcode:', error);
    }
  };

  const getStockStatusBadge = (product) => {
    if (!product) return null;
    if ((product.currentStock ?? 0) <= (product.minStockLevel ?? 0)) {
      return <span className="badge-danger">Low Stock</span>;
    }
    if ((product.currentStock ?? 0) >= (product.maxStockLevel ?? Infinity)) {
      return <span className="badge-warning">Over Stock</span>;
    }
    return <span className="badge-success">Normal</span>;
  };

  if (loadingProducts) return <LoadingSpinner size="lg" className="h-64" />;

  return (
    <div className="space-y-6">
      {/* Page Header and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button onClick={() => setShowScanner(true)} className="btn btn-outline">
            <HiQrcode className="w-4 h-4 mr-2" /> Scan Barcode
          </button>
          <button onClick={handleAddProduct} className="btn btn-primary">
            <HiPlus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body overflow-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-gray-500">{product.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-gray-600 px-2 rounded">{product.sku}</span>
                  </td>
                  <td>
                    <span className="inline-block px-2 rounded text-white" style={{ backgroundColor: product.category?.color ?? '#999' }}>
                      {product.category?.name ?? 'N/A'}
                    </span>
                  </td>
                  <td>
                    <p>{product.currentStock ?? 0} {product.unit ?? ''}</p>
                    <p className="text-xs text-gray-500">Min: {product.minStockLevel ?? 0} | Max: {product.maxStockLevel ?? 'N/A'}</p>
                  </td>
                  <td>
                    <p>${product.sellingPrice ?? 0}</p>
                    <p className="text-xs text-gray-500">Cost: ${product.costPrice ?? 0}</p>
                  </td>
                  <td>{getStockStatusBadge(product)}</td>
                  <td>
                    <button className='ms-3' onClick={() => handleViewProduct(product)} title="View Details"><HiEye /></button>
                    <button className='ms-3' onClick={() => handleEditProduct(product)} title="Edit Product"><HiPencil /></button>
                    <button className='ms-3' onClick={() => handleDeleteProduct(product._id)} title="Delete Product"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-between p-3">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Previous
              </button>
              <div>Page {currentPage} of {totalPages}</div>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setShowModal(false)}
          onSaved={handleProductSaved}
        />
      )}
      {showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
        />
      )}
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onScan={handleBarcodeScan}
        />
      )}
    </div>
  );
};

export default Products;
