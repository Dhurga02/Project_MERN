const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide supplier name'],
      trim: true,
      maxlength: [100, 'Supplier name cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please provide supplier code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    contactPerson: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Contact person name cannot be more than 100 characters'],
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please provide a valid email',
        ],
      },
      phone: {
        type: String,
        trim: true,
      },
      position: {
        type: String,
        trim: true,
      },
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    website: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    paymentTerms: {
      type: String,
      enum: ['net30', 'net60', 'net90', 'immediate', 'custom'],
      default: 'net30',
    },
    creditLimit: {
      type: Number,
      min: [0, 'Credit limit cannot be negative'],
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for supplier performance
SupplierSchema.virtual('performance').get(function () {
  if (this.rating >= 4) return 'excellent';
  if (this.rating >= 3) return 'good';
  if (this.rating >= 2) return 'fair';
  return 'poor';
});

// Ensure virtual fields are serialized
SupplierSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
