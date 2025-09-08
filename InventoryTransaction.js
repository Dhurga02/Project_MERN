const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide product'],
    },
    type: {
      type: String,
      required: [true, 'Please provide transaction type'],
      enum: ['in', 'out', 'adjustment', 'transfer', 'return', 'damage', 'expiry'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
    },
    totalValue: {
      type: Number,
      min: [0, 'Total value cannot be negative'],
    },
    reference: {
      type: String,
      trim: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
    },
    location: {
      from: {
        warehouse: String,
        aisle: String,
        shelf: String,
        bin: String,
      },
      to: {
        warehouse: String,
        aisle: String,
        shelf: String,
        bin: String,
      },
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for transaction'],
      maxlength: [200, 'Reason cannot be more than 200 characters'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user who performed the transaction'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
InventoryTransactionSchema.index({
  product: 1,
  type: 1,
  transactionDate: -1,
  status: 1,
});

// Virtual for transaction impact
InventoryTransactionSchema.virtual('stockImpact').get(function () {
  if (this.type === 'in' || this.type === 'return') {
    return this.quantity;
  } else if (['out', 'damage', 'expiry'].includes(this.type)) {
    return -this.quantity;
  }
  return 0;
});

// Ensure virtual fields are serialized
InventoryTransactionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);
