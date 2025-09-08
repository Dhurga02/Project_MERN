const express = require('express');
const QRCode = require('qrcode');
const bwipjs = require('bwip-js');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/barcodes/generate/new
// @desc    Generate a new unique barcode string
// @access  Private
router.get('/generate/new', auth, async (req, res) => {
  try {
    // Generate a unique barcode string
    const newBarcode = `BC${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

    // Check uniqueness
    const existing = await Product.findOne({ barcode: newBarcode });
    if (existing) {
      return res.status(500).json({ msg: 'Barcode collision, try again' });
    }

    res.json({ barcode: newBarcode });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/barcodes/generate/:productId
// @desc    Generate barcode for a product
// @access  Private
router.get('/generate/:productId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Generate barcode image
    const barcodeData = {
      sku: product.sku,
      barcode: product.barcode,
      name: product.name
    };

    const barcodeOptions = {
      bcid: 'code128',
      text: product.barcode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    };

    // Generate barcode as PNG
    const barcodeBuffer = await bwipjs.toBuffer(barcodeOptions);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(barcodeData));

    res.json({
      product,
      barcode: barcodeBuffer.toString('base64'),
      qrCode: qrCodeDataUrl,
      barcodeData
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   POST api/barcodes/scan
// @desc    Scan barcode and get product info
// @access  Private
router.post('/scan', auth, async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ msg: 'Barcode is required' });
    }

    const product = await Product.findOne({ 
      barcode: barcode,
      isActive: true 
    }).populate('category', 'name color').populate('supplier', 'name code');

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/barcodes/bulk-generate
// @desc    Generate barcodes for multiple products
// @access  Private
router.get('/bulk-generate', auth, async (req, res) => {
  try {
    const { productIds } = req.query;
    
    if (!productIds) {
      return res.status(400).json({ msg: 'Product IDs are required' });
    }

    const ids = productIds.split(',');
    const products = await Product.find({ 
      _id: { $in: ids },
      isActive: true 
    });

    const barcodes = [];
    
    for (const product of products) {
      const barcodeOptions = {
        bcid: 'code128',
        text: product.barcode,
        scale: 2,
        height: 8,
        includetext: true,
        textxalign: 'center'
      };

      const barcodeBuffer = await bwipjs.toBuffer(barcodeOptions);
      
      barcodes.push({
        product,
        barcode: barcodeBuffer.toString('base64')
      });
    }

    res.json(barcodes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
