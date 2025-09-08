const Product = require("../models/Product");
const Category = require("../models/Category");
const Supplier = require("../models/Supplier");

// 📌 Get all products (with pagination + populate)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate("category", "name color")
      .populate("supplier", "name rating")
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments();

    res.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error fetching products" });
  }
};

// 📌 Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name color")
      .populate("supplier", "name rating");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    res.status(500).json({ message: "Server error fetching product" });
  }
};

// 📌 Create a new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      supplier,
      costPrice,
      sellingPrice,
      stock,
    } = req.body;

    // ✅ Validate category & supplier exist
    const foundCategory = await Category.findById(category);
    if (!foundCategory) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const foundSupplier = await Supplier.findById(supplier);
    if (!foundSupplier) {
      return res.status(400).json({ message: "Invalid supplier ID" });
    }

    const newProduct = new Product({
      name,
      sku,
      category,
      supplier,
      costPrice,
      sellingPrice,
      stock,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error creating product" });
    }
  }
};

// 📌 Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.category) {
      const foundCategory = await Category.findById(updates.category);
      if (!foundCategory) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    if (updates.supplier) {
      const foundSupplier = await Supplier.findById(updates.supplier);
      if (!foundSupplier) {
        return res.status(400).json({ message: "Invalid supplier ID" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name color")
      .populate("supplier", "name rating");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      res.status(400).json({ message: error.message });
    } else if (error.kind === "ObjectId") {
      res.status(400).json({ message: "Invalid product ID" });
    } else {
      res.status(500).json({ message: "Server error updating product" });
    }
  }
};

// 📌 Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    res.status(500).json({ message: "Server error deleting product" });
  }
};
