const express = require('express');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: Convert to ObjectId safely with 'new' keyword
const toObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;

// Format validation errors helper
const formatValidationErrors = (errorsArray) => {
  const formattedErrors = {};
  errorsArray.forEach(error => {
    if (!formattedErrors[error.param]) {
      formattedErrors[error.param] = [];
    }
    formattedErrors[error.param].push(error.msg);
  });
  return formattedErrors;
};

// @route   GET api/products
// @desc    Get all products with filtering, pagination, and sorting
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search,
      category,
      supplier,
      stockStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && toObjectId(category)) query.category = toObjectId(category);
    if (supplier && toObjectId(supplier)) query.supplier = toObjectId(supplier);

    if (stockStatus) {
      if (stockStatus === 'low') query.$expr = { $lte: ['$currentStock', '$minStockLevel'] };
      else if (stockStatus === 'high') query.$expr = { $gte: ['$currentStock', '$maxStockLevel'] };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name color')
      .populate('supplier', 'name code contactPerson')
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalProducts: count,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/products/barcode/:barcode
router.get('/barcode/:barcode', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode, isActive: true })
      .populate('category', 'name color')
      .populate('supplier', 'name code contactPerson');

    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/products/sku/:sku
router.get('/sku/:sku', auth, async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase(), isActive: true })
      .populate('category', 'name color')
      .populate('supplier', 'name code contactPerson');

    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/products/:id
router.get('/:id', auth, async (req, res) => {
  try {
    if (!toObjectId(req.params.id)) return res.status(404).json({ msg: 'Product not found' });

    const product = await Product.findById(req.params.id)
      .populate('category', 'name color')
      .populate('supplier', 'name code contactPerson');

    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/products
router.post(
  '/',
  auth,
  [
    check('name', 'Product name is required').notEmpty(),
    check('sku', 'SKU is required').notEmpty(),
    check('category', 'Category is required').isMongoId(),
    check('costPrice', 'Cost price is required and must be a number').isNumeric(),
    check('sellingPrice', 'Selling price is required and must be a number').isNumeric(),
    check('unit', 'Unit is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array()),
      });
    }

    try {
      const {
        name,
        sku,
        barcode,
        description,
        category,
        supplier,
        unit,
        costPrice,
        sellingPrice,
        minStockLevel,
        maxStockLevel,
        location,
        dimensions,
        tags,
      } = req.body;

      const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingProduct) return res.status(400).json({ msg: 'SKU already exists' });

      if (barcode) {
        const existingBarcode = await Product.findOne({ barcode });
        if (existingBarcode) return res.status(400).json({ msg: 'Barcode already exists' });
      }

      const generatedBarcode = barcode || `BC${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

      const product = new Product({
        name,
        sku: sku.toUpperCase(),
        barcode: generatedBarcode,
        description,
        category: toObjectId(category),
        supplier: supplier ? toObjectId(supplier) : undefined,
        unit,
        costPrice,
        sellingPrice,
        minStockLevel: minStockLevel || 10,
        maxStockLevel,
        location,
        dimensions,
        tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(tag => tag.trim()) : [],
      });

      await product.save();
      const populatedProduct = await Product.findById(product._id)
        .populate('category', 'name color')
        .populate('supplier', 'name code contactPerson');

      res.status(201).json(populatedProduct);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route   PUT api/products/:id
router.put(
  '/:id',
  auth,
  [
    check('name', 'Product name is required').notEmpty(),
    check('sku', 'SKU is required').notEmpty(),
    check('category', 'Category is required').isMongoId(),
    check('costPrice', 'Cost price is required and must be a number').isNumeric(),
    check('sellingPrice', 'Selling price is required and must be a number').isNumeric(),
    check('unit', 'Unit is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatValidationErrors(errors.array()),
      });
    }

    try {
      const {
        name,
        sku,
        barcode,
        description,
        category,
        supplier,
        unit,
        costPrice,
        sellingPrice,
        minStockLevel,
        maxStockLevel,
        location,
        dimensions,
        tags,
      } = req.body;

      const existingProduct = await Product.findOne({ sku: sku.toUpperCase(), _id: { $ne: req.params.id } });
      if (existingProduct) return res.status(400).json({ msg: 'SKU already exists' });

      if (barcode) {
        const existingBarcode = await Product.findOne({ barcode, _id: { $ne: req.params.id } });
        if (existingBarcode) return res.status(400).json({ msg: 'Barcode already exists' });
      }

      const productFields = {
        name,
        sku: sku.toUpperCase(),
        barcode,
        description,
        category: toObjectId(category),
        supplier: supplier ? toObjectId(supplier) : undefined,
        unit,
        costPrice,
        sellingPrice,
        minStockLevel: minStockLevel || 10,
        maxStockLevel,
        location,
        dimensions,
        tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map(tag => tag.trim()) : [],
      };

      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { $set: productFields }, { new: true, runValidators: true })
        .populate('category', 'name color')
        .populate('supplier', 'name code contactPerson');

      if (!updatedProduct) return res.status(404).json({ msg: 'Product not found' });
      res.json(updatedProduct);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Product not found' });
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route   DELETE api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!toObjectId(req.params.id)) return res.status(404).json({ msg: 'Product not found' });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });

    product.isActive = false;
    await product.save();

    res.json({ msg: 'Product removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;