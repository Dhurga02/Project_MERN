const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@inventory.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  },
  {
    username: 'manager',
    email: 'manager@inventory.com',
    password: 'manager123',
    firstName: 'John',
    lastName: 'Manager',
    role: 'manager',
    isActive: true,
  },
  {
    username: 'employee',
    email: 'employee@inventory.com',
    password: 'employee123',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'employee',
    isActive: true,
  },
];

const sampleCategories = [
  { name: 'Electronics', description: 'Electronic items', color: '#ff9800' },
  { name: 'Furniture', description: 'Home and office furniture', color: '#4caf50' },
  { name: 'Groceries', description: 'Daily grocery products', color: '#2196f3' },
];

const sampleSuppliers = [
  { name: 'Best Electronics', code: 'BE01', phone: '1234567890', email: 'contact@bestelectronics.com' },
  { name: 'Comfort Furniture', code: 'CF01', phone: '2345678901', email: 'sales@comfortfurniture.com' },
  { name: 'Fresh Groceries', code: 'FG01', phone: '3456789012', email: 'orders@freshgroceries.com' },
];

const sampleProducts = [
  { name: 'Smartphone', sku: 'ELEC001', costPrice: 200, sellingPrice: 300, unit: 'piece' },
  { name: 'Office Chair', sku: 'FURN001', costPrice: 50, sellingPrice: 80, unit: 'piece' },
  { name: 'Organic Apples', sku: 'GROC001', costPrice: 1, sellingPrice: 2, unit: 'kg' },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-inventory', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // Create categories
    const createdCategories = [];
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
    }

    // Create suppliers and assign categories
    const createdSuppliers = [];
    for (let i = 0; i < sampleSuppliers.length; i++) {
      const supplierData = sampleSuppliers[i];
      const category = createdCategories[i];
      const supplier = new Supplier({
        ...supplierData,
        categories: [category._id],
      });
      await supplier.save();
      createdSuppliers.push(supplier);
      console.log(`✅ Created supplier: ${supplier.name}`);
    }

    // Create products and assign categories/suppliers
    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const category = createdCategories[i % createdCategories.length];
      const supplier = createdSuppliers[i % createdSuppliers.length];
      const product = new Product({
        ...productData,
        category: category._id,
        supplier: supplier._id,
      });
      await product.save();
      console.log(`✅ Created product: ${product.name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager / manager123');
    console.log('Employee: employee / employee123');
    console.log('\n🔗 Start the application with: npm run dev');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
