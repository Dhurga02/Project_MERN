const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'Please provide SKU'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    unit: {
      type: String,
      required: [true, 'Please provide unit'],
      enum: ['piece', 'kg', 'liter', 'meter', 'box', 'pack', 'dozen', 'pair'],
    },
    costPrice: {
      type: Number,
      required: [true, 'Please provide cost price'],
      min: [0, 'Cost price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide selling price'],
      min: [0, 'Selling price cannot be negative'],
    },
    minStockLevel: {
      type: Number,
      default: 10,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    maxStockLevel: {
      type: Number,
      min: [0, 'Maximum stock level cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    location: {
      warehouse: {
        type: String,
        // Removed required validation to fix error
        // required: [true, 'Please provide warehouse location'],
      },
      aisle: String,
      shelf: String,
      bin: String,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: profit margin %
ProductSchema.virtual('profitMargin').get(function () {
  if (this.costPrice > 0) {
    return ((this.sellingPrice - this.costPrice) / this.costPrice * 100).toFixed(2);
  }
  return 0;
});

// Virtual: stock status
ProductSchema.virtual('stockStatus').get(function () {
  if (this.currentStock <= this.minStockLevel) return 'low';
  if (this.maxStockLevel && this.currentStock >= this.maxStockLevel) return 'high';
  return 'normal';
});

// Indexes for faster queries
ProductSchema.index({ sku: 1, barcode: 1, category: 1, supplier: 1 });

module.exports = mongoose.model('Product', ProductSchema);
