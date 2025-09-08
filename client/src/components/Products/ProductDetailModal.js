import React from 'react';
import { HiX, HiQrcode, HiTag, HiTruck } from 'react-icons/hi';

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  const getStockStatusBadge = () => {
    if (product.currentStock <= product.minStockLevel) {
      return <span className="badge-danger">Low Stock</span>;
    } else if (product.currentStock >= product.maxStockLevel) {
      return <span className="badge-warning">Over Stock</span>;
    }
    return <span className="badge-success">Normal</span>;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-medium text-gray-500">Product Name</label>
                 <p className="mt-1 text-sm text-gray-900">{product.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">SKU</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{product.sku}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Barcode</label>
                <div className="mt-1 flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-900">{product.barcode}</p>
                  <HiQrcode className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Unit</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{product.unit}</p>
              </div>
            </div>
            {product.description && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900">{product.description}</p>
              </div>
            )}
          </div>

          {/* Stock Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stock Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Current Stock</label>
                 <p className="mt-1 text-lg font-semibold text-gray-900">
                  {product.currentStock} {product.unit}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Minimum Level</label>
                <p className="mt-1 text-sm text-gray-900">{product.minStockLevel} {product.unit}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Maximum Level</label>
                <p className="mt-1 text-sm text-gray-900">{product.maxStockLevel || 'N/A'} {product.unit}</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500">Stock Status</label>
              <div className="mt-1">{getStockStatusBadge()}</div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pricing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Cost Price</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">${product.costPrice}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Selling Price</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">${product.sellingPrice}</p>
              </div>
            </div>
            {product.profitMargin && (
                  <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500">Profit Margin</label>
                <p className="mt-1 text-sm text-gray-900">{product.profitMargin}%</p>
              </div>
            )}
          </div>

          {/* Category and Supplier */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Classification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500">Category</label>
                <div className="mt-1 flex items-center space-x-2">
                  <HiTag className="w-4 h-4 text-gray-400" />
                  <span 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${product.category?.color}20`,
                      color: product.category?.color 
                    }}
                  >
                    {product.category?.name}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500">Supplier</label>
                <div className="mt-1 flex items-center space-x-2">
                  <HiTruck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {product.supplier?.name || 'N/A'}
                  </span>
                </div>
                  </div>
            </div>
          </div>

          {/* Location Information */}
          {product.location && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500">Warehouse</label>
                  <p className="mt-1 text-sm text-gray-900">{product.location.warehouse}</p>
                </div>
                {product.location.aisle && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Aisle</label>
                    <p className="mt-1 text-sm text-gray-900">{product.location.aisle}</p>
                  </div>
                )}
                {product.location.shelf && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Shelf</label>
                    <p className="mt-1 text-sm text-gray-900">{product.location.shelf}</p>
                  </div>
                )}
                {product.location.bin && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Bin</label>
                    <p className="mt-1 text-sm text-gray-900">{product.location.bin}</p>
                  </div>
                )}
              </div>
            </div>
            )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Notes</h4>
              <p className="text-sm text-gray-900">{product.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
