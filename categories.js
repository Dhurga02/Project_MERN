const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Category = require('../models/Category');

const router = express.Router();

// @route   GET api/categories
// @desc    Get all active categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/categories
// @desc    Create a category
// @access  Private
router.post(
  '/',
  auth,
  [check('name', 'Category name is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      let { name, description, parentCategory = null, color, icon } = req.body;

      if (parentCategory === '') parentCategory = null;

      const category = new Category({
        name,
        description,
        parentCategory,
        color,
        icon,
        isActive: true,
      });

      await category.save();

      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private
router.put(
  '/:id',
  auth,
  [check('name', 'Category name is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.body.parentCategory === '') req.body.parentCategory = null;

      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!category) return res.status(404).json({ msg: 'Category not found' });

      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/categories/:id
// @desc    Soft delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ msg: 'Category not found' });

    category.isActive = false;
    await category.save();

    res.json({ msg: 'Category removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
