import React, { useState, useEffect } from 'react';
import { HiArrowUp, HiArrowDown, HiAdjustments } from 'react-icons/hi';
import axios from 'axios';
import toast from 'react-hot-toast';
import StockInModal from './StockInModal';
import StockOutModal from './StockOutModal';
import AdjustmentModal from './AdjustmentModal';
import LoadingSpinner from '../UI/LoadingSpinner';

const Inventory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      const response = await axios.get(`/api/inventory/transactions?${params}`);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleTransactionSaved = () => {
    fetchTransactions();
    fetchProducts();
  };

  const getTransactionTypeBadge = (type) => {
    const badges = {
      in: 'badge-success',
      out: 'badge-danger',
      adjustment: 'badge-info',
      transfer: 'badge-warning',
      return: 'badge-success',
      damage: 'badge-danger',
      expiry: 'badge-danger'
    };
    return badges[type] || 'badge-info';
  };

  const getTransactionTypeIcon = (type) => {
    const icons = {
      in: HiArrowUp,
      out: HiArrowDown,
      adjustment: HiAdjustments
    };
    return icons[type] || HiAdjustments;
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage stock movements and transactions</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowStockInModal(true)}
            className="btn btn-success"
          >
            <HiArrowUp className="w-4 h-4 mr-2" />
            Stock In
          </button>
          <button
            onClick={() => setShowStockOutModal(true)}
            className="btn btn-danger"
          >
            <HiArrowDown className="w-4 h-4 mr-2" />
            Stock Out
          </button>
          <button
            onClick={() => setShowAdjustmentModal(true)}
            className="btn btn-info"
          >
            <HiAdjustments className="w-4 h-4 mr-2" />
            Adjustment
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Previous Stock</th>
                  <th>New Stock</th>
                  <th>Performed By</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
               <tbody>
                {transactions.map((transaction) => {
                  const IconComponent = getTransactionTypeIcon(transaction.type);
                  return (
                    <tr key={transaction._id}>
                      <td>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-4 h-4 text-gray-400" />
                          <span className={`badge ${getTransactionTypeBadge(transaction.type)}`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.product?.name}</p>
                          <p className="text-sm text-gray-500">{transaction.product?.sku}</p>
                        </div>
                      </td>
                      <td className="font-medium">{transaction.quantity}</td>
                      <td className="text-gray-600">{transaction.previousStock}</td>
                      <td className="font-medium">{transaction.newStock}</td>
                      <td>
                        {transaction.performedBy?.firstName} {transaction.performedBy?.lastName}
                      </td>
                      <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          transaction.status === 'completed' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showStockInModal && (
        <StockInModal
          products={products}
          onClose={() => setShowStockInModal(false)}
          onSaved={handleTransactionSaved}
        />
      )}

      {showStockOutModal && (
        <StockOutModal
          products={products}
          onClose={() => setShowStockOutModal(false)}
          onSaved={handleTransactionSaved}
        />
      )}

      {showAdjustmentModal && (
        <AdjustmentModal
          products={products}
          onClose={() => setShowAdjustmentModal(false)}
          onSaved={handleTransactionSaved}
        />
      )}
    </div>
  );
};

export default Inventory;
