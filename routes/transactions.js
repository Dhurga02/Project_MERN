const express = require('express');
const InventoryTransaction = require('../models/InventoryTransaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/transactions
// @desc    Get all transactions sorted by date descending
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ transactionDate: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await InventoryTransaction.findById(req.params.id)
      .populate('product', 'name sku barcode')
      .populate('performedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
