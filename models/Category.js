const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#007bff',
    },
    icon: {
      type: String,
      default: 'box',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Ensure virtual fields are serialized
CategorySchema.set('toJSON', { virtuals: true });

// Prevent OverwriteModelError
module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
