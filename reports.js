const express = require('express');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Inventory Summary Report
router.get('/inventory-summary', auth, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });

    const summary = {
      totalProducts: products.length,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      categoryBreakdown: {},
      supplierBreakdown: {}
    };

    products.forEach(product => {
      const value = product.currentStock * product.costPrice;
      summary.totalValue += value;

      if (product.currentStock <= product.minStockLevel) {
        summary.lowStockCount++;
      }
      if (product.currentStock === 0) {
        summary.outOfStockCount++;
      }

      if (product.category) {
        const categoryId = product.category.toString();
        if (!summary.categoryBreakdown[categoryId]) {
          summary.categoryBreakdown[categoryId] = { count: 0, value: 0 };
        }
        summary.categoryBreakdown[categoryId].count++;
        summary.categoryBreakdown[categoryId].value += value;
      }

      if (product.supplier) {
        const supplierId = product.supplier.toString();
        if (!summary.supplierBreakdown[supplierId]) {
          summary.supplierBreakdown[supplierId] = { count: 0, value: 0 };
        }
        summary.supplierBreakdown[supplierId].count++;
        summary.supplierBreakdown[supplierId].value += value;
      }
    });

    summary.totalValue = summary.totalValue.toFixed(2);

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Transaction Summary Report
router.get('/transaction-summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'startDate and endDate are required' });
    }

    const query = {
      transactionDate: {
        $gte: new Date(startDate),
        $lte: (() => {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return end;
        })()
      }
    };

    const transactions = await InventoryTransaction.find(query)
      .populate('product', 'name sku category');

    const summary = {
      totalTransactions: transactions.length,
      totalIn: 0,
      totalOut: 0,
      totalValue: 0,
      typeBreakdown: {},
      dailyBreakdown: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'in') {
        summary.totalIn += transaction.quantity;
      } else if (transaction.type === 'out') {
        summary.totalOut += transaction.quantity;
      }

      summary.totalValue += transaction.totalValue || 0;

      if (!summary.typeBreakdown[transaction.type]) {
        summary.typeBreakdown[transaction.type] = { count: 0, quantity: 0, value: 0 };
      }
      summary.typeBreakdown[transaction.type].count++;
      summary.typeBreakdown[transaction.type].quantity += transaction.quantity;
      summary.typeBreakdown[transaction.type].value += transaction.totalValue || 0;

      const date = transaction.transactionDate.toISOString().split('T')[0];
      if (!summary.dailyBreakdown[date]) {
        summary.dailyBreakdown[date] = { count: 0, quantity: 0, value: 0 };
      }
      summary.dailyBreakdown[date].count++;
      summary.dailyBreakdown[date].quantity += transaction.quantity;
      summary.dailyBreakdown[date].value += transaction.totalValue || 0;
    });

    summary.totalValue = summary.totalValue.toFixed(2);

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Low Stock Report
router.get('/low-stock-report', auth, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
      isActive: true
    }).populate('category', 'name').populate('supplier', 'name code');

    const report = lowStockProducts.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      currentStock: product.currentStock,
      minStockLevel: product.minStockLevel,
      category: product.category?.name,
      supplier: product.supplier?.name,
      supplierCode: product.supplier?.code,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockValue: (product.currentStock * product.costPrice).toFixed(2)
    }));

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Overstock Report
router.get('/overstock-report', auth, async (req, res) => {
  try {
    const overStockProducts = await Product.find({
      $expr: { $gte: ['$currentStock', '$maxStockLevel'] },
      isActive: true
    }).populate('category', 'name').populate('supplier', 'name code');

    const report = overStockProducts.map(product => ({
      id: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      currentStock: product.currentStock,
      maxStockLevel: product.maxStockLevel,
      category: product.category?.name,
      supplier: product.supplier?.name,
      supplierCode: product.supplier?.code,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockValue: (product.currentStock * product.costPrice).toFixed(2)
    }));

    res.json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
