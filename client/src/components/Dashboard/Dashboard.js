import React, { useState, useEffect } from 'react';
import { HiCube, HiArchive, HiExclamation, HiCheckCircle } from 'react-icons/hi';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [inventoryRes, alertsRes] = await Promise.all([
          axios.get('/api/inventory/dashboard'),
          axios.get('/api/inventory/stock-alerts')
        ]);

        setDashboardData({
          inventory: inventoryRes.data,
          alerts: alertsRes.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { inventory, alerts } = dashboardData || {};

  const chartData = [
    { name: 'Products', value: inventory?.totalProducts || 0, color: '#3B82F6' },
    { name: 'Low Stock', value: inventory?.lowStockCount || 0, color: '#F59E0B' },
    { name: 'Out of Stock', value: inventory?.outOfStockCount || 0, color: '#EF4444' }
  ];

  const recentTransactions = inventory?.recentTransactions || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your inventory management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <HiCube className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{inventory?.totalProducts || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <HiArchive className="w-5 h-5 text-success-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-semibold text-gray-900">${inventory?.totalValue || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                  <HiExclamation className="w-5 h-5 text-warning-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{inventory?.lowStockCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                  <HiCheckCircle className="w-5 h-5 text-danger-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{inventory?.outOfStockCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Inventory Overview</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {alerts?.lowStock?.slice(0, 5).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Current: {product.currentStock} | Min: {product.minStockLevel}</p>
                  </div>
                  <span className="badge-warning">Low Stock</span>
                </div>
              ))}
              
              {alerts?.overStock?.slice(0, 3).map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-info-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">Current: {product.currentStock} | Max: {product.maxStockLevel}</p>
                  </div>
                  <span className="badge-info">Over Stock</span>
                </div>
              ))}

              {(!alerts?.lowStock?.length && !alerts?.overStock?.length) && (
                <p className="text-gray-500 text-center py-4">No stock alerts at the moment</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Performed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="font-medium">{transaction.product?.name}</td>
                    <td>
                      <span className={`badge ${
                        transaction.type === 'in' ? 'badge-success' : 
                        transaction.type === 'out' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>{transaction.performedBy?.firstName} {transaction.performedBy?.lastName}</td>
                    <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
