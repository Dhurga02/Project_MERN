const express = require('express');
const { check, validationResult } = require('express-validator');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/inventory/transactions
// @desc    Get all inventory transactions (with pagination, filtering, sorting)
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      product,
      type,
      startDate,
      endDate,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};

    if (product) query.product = product;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await InventoryTransaction.find(query)
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName username')
      .populate('approvedBy', 'firstName lastName username')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await InventoryTransaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalTransactions: count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

const validateStockFields = [
  check('product', 'Product is required').notEmpty(),
  check('quantity', 'Quantity must be a number').isNumeric(),
  check('unitPrice', 'Unit price must be a number').optional().isNumeric(),
  check('reason', 'Reason is required').notEmpty(),
];

// @route   POST api/inventory/stock-in
// @desc    Add stock to inventory
// @access  Private
router.post('/stock-in', auth, validateStockFields, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { product, quantity, unitPrice, reference, referenceNumber, location, reason, notes } = req.body;

    const currentProduct = await Product.findById(product);
    if (!currentProduct) return res.status(404).json({ msg: 'Product not found' });

    const previousStock = currentProduct.currentStock;
    const newStock = previousStock + quantity;
    const totalValue = unitPrice ? quantity * unitPrice : 0;

    const transaction = new InventoryTransaction({
      product,
      type: 'in',
      quantity,
      previousStock,
      newStock,
      unitPrice,
      totalValue,
      reference,
      referenceNumber,
      location: { to: location },
      reason,
      notes,
      performedBy: req.user.id,
      status: 'completed',
    });

    await transaction.save();

    currentProduct.currentStock = newStock;
    await currentProduct.save();

    const populatedTransaction = await InventoryTransaction.findById(transaction._id)
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName username');

    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/inventory/stock-out
// @desc    Remove stock from inventory
// @access  Private
router.post('/stock-out', auth, validateStockFields, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { product, quantity, unitPrice, reference, referenceNumber, location, reason, notes } = req.body;

    const currentProduct = await Product.findById(product);
    if (!currentProduct) return res.status(404).json({ msg: 'Product not found' });

    if (currentProduct.currentStock < quantity) return res.status(400).json({ msg: 'Insufficient stock' });

    const previousStock = currentProduct.currentStock;
    const newStock = previousStock - quantity;
    const totalValue = unitPrice ? quantity * unitPrice : 0;

    const transaction = new InventoryTransaction({
      product,
      type: 'out',
      quantity,
      previousStock,
      newStock,
      unitPrice,
      totalValue,
      reference,
      referenceNumber,
      location: { from: location },
      reason,
      notes,
      performedBy: req.user.id,
      status: 'completed',
    });

    await transaction.save();

    currentProduct.currentStock = newStock;
    await currentProduct.save();

    const populatedTransaction = await InventoryTransaction.findById(transaction._id)
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName username');

    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/inventory/adjustment
// @desc    Adjust stock quantity (set exact quantity)
// @access  Private
router.post('/adjustment', auth, [
  check('product', 'Product is required').notEmpty(),
  check('quantity', 'Quantity must be a number').isNumeric(),
  check('reason', 'Reason is required').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { product, quantity, reason, notes } = req.body;

    const currentProduct = await Product.findById(product);
    if (!currentProduct) return res.status(404).json({ msg: 'Product not found' });

    const previousStock = currentProduct.currentStock;
    const newStock = quantity;
    const stockDifference = newStock - previousStock;

    const transaction = new InventoryTransaction({
      product,
      type: 'adjustment',
      quantity: Math.abs(stockDifference),
      previousStock,
      newStock,
      reason,
      notes,
      performedBy: req.user.id,
      status: 'completed',
    });

    await transaction.save();

    currentProduct.currentStock = newStock;
    await currentProduct.save();

    const populatedTransaction = await InventoryTransaction.findById(transaction._id)
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName username');

    res.json(populatedTransaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/inventory/stock-alerts
// @desc    Get low stock and overstock alerts
// @access  Private
router.get('/stock-alerts', auth, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
      isActive: true
    }).populate('category', 'name color').populate('supplier', 'name code');

    const overStockProducts = await Product.find({
      $expr: { $gte: ['$currentStock', '$maxStockLevel'] },
      isActive: true
    }).populate('category', 'name color').populate('supplier', 'name code');

    res.json({
      lowStock: lowStockProducts,
      overStock: overStockProducts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/inventory/dashboard
// @desc    Get inventory dashboard data summary
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] },
      isActive: true
    });
    const outOfStockCount = await Product.countDocuments({
      currentStock: 0,
      isActive: true
    });

    const recentTransactions = await InventoryTransaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'firstName lastName')
      .sort({ transactionDate: -1 })
      .limit(10);

    const products = await Product.find({ isActive: true });
    const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0);

    res.json({
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalValue: totalValue.toFixed(2),
      recentTransactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
