import React, { useState, useEffect } from 'react';
import { HiDownload } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import LoadingSpinner from '../UI/LoadingSpinner';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [lowStockReport, setLowStockReport] = useState([]);
  const [overStockReport, setOverStockReport] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  async function fetchReports() {
    try {
      setLoading(true);
      const [inventoryRes, transactionRes, lowStockRes, overStockRes] = await Promise.all([
        axios.get('/api/reports/inventory-summary'),
        axios.get(`/api/reports/transaction-summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get('/api/reports/low-stock'),
        axios.get('/api/reports/over-stock'),
      ]);

      setInventorySummary(inventoryRes.data);
      setTransactionSummary(transactionRes.data);
      setLowStockReport(lowStockRes.data);
      setOverStockReport(overStockRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const exportReport = (data, filename) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner size="lg" className="h-64" />;

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B4D2'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-gray-600">Comprehensive inventory insights</p>
      </div>

      {/* Date Filter */}
      <div className="card">
        <div className="card-body flex gap-4">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" value={dateRange.startDate}
              onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
              className="input mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input type="date" value={dateRange.endDate}
              onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
              className="input mt-1" />
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3>Inventory Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{inventorySummary?.totalProducts ?? 0}</p>
                <p>Total Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${inventorySummary?.totalValue ?? '0.00'}</p>
                <p>Total Inventory Value</p>
              </div>
            </div>
            <div style={{ height: 250 }} className="mt-4">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={[
                    { name: 'Products', value: inventorySummary?.totalProducts ?? 0 },
                    { name: 'Low Stock', value: inventorySummary?.lowStockCount ?? 0 },
                    { name: 'Out of Stock', value: inventorySummary?.outOfStockCount ?? 0 }
                  ]} dataKey="value" outerRadius={80}>
                    {chartColors.slice(0, 3).map((color, index) => <Cell key={index} fill={color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="card">
          <div className="card-header">
            <h3>Transaction Summary</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{transactionSummary?.totalTransactions ?? 0}</p>
                <p>Total Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">${transactionSummary?.totalValue ?? '0.00'}</p>
                <p>Total Transaction Value</p>
              </div>
            </div>
            <div style={{ height: 250 }} className="mt-4">
              <ResponsiveContainer>
                <BarChart data={[
                  { name: 'Stock In', value: transactionSummary?.totalIn ?? 0 },
                  { name: 'Stock Out', value: transactionSummary?.totalOut ?? 0 }
                ]}>
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={chartColors[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Report */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3>Low Stock Report</h3>
          <button onClick={() => exportReport(lowStockReport, 'low_stock_report.csv')} className="btn btn-outline">
            <HiDownload className="w-5 h-5 mr-2" /> Export CSV
          </button>
        </div>
        <div className="card-body overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Min Level</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {lowStockReport.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td><span className="badge badge-danger">{item.currentStock}</span></td>
                  <td>{item.minLevel}</td>
                  <td>{item.category}</td>
                  <td>{item.supplier}</td>
                  <td>${item.stockValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overstock Report */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3>Overstock Report</h3>
          <button onClick={() => exportReport(overStockReport, 'over_stock_report.csv')} className="btn btn-outline">
            <HiDownload className="w-5 h-5 mr-2" /> Export CSV
          </button>
        </div>
        <div className="card-body overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Max Level</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {overStockReport.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td><span className="badge badge-warning">{item.currentStock}</span></td>
                  <td>{item.maxLevel}</td>
                  <td>{item.category}</td>
                  <td>{item.supplier}</td>
                  <td>${item.stockValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Reports;
