import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";
import Supplier from "./models/Supplier.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Transaction.deleteMany({});
    console.log("✅ Cleared all collections\n");

    // Create users
    console.log("👥 Creating users...");
    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: "admin123",
      role: "admin",
      phone: "0123456789",
    });

    const manager = await User.create({
      name: "Manager User",
      email: "manager@test.com",
      password: "manager123",
      role: "manager",
      phone: "0198765432",
    });

    const cashier = await User.create({
      name: "Cashier User",
      email: "cashier@test.com",
      password: "cashier123",
      role: "cashier",
      phone: "0187654321",
    });

    console.log("✅ Created 3 users\n");

    // Create categories
    console.log("📁 Creating categories...");
    const beverages = await Category.create({
      name: "Beverages",
      description: "Soft drinks, juices, and other beverages",
    });

    const snacks = await Category.create({
      name: "Snacks",
      description: "Chips, crackers, and snack items",
    });

    const groceries = await Category.create({
      name: "Groceries",
      description: "Daily essential grocery items",
    });

    const dairy = await Category.create({
      name: "Dairy",
      description: "Milk, cheese, and dairy products",
    });

    console.log("✅ Created 4 categories\n");

    // Create suppliers
    console.log("🏭 Creating suppliers...");
    const supplier1 = await Supplier.create({
      name: "ABC Beverages",
      company: "ABC Trading Sdn Bhd",
      email: "sales@abc.com",
      phone: "0312345678",
      paymentTerms: "net30",
    });

    const supplier2 = await Supplier.create({
      name: "XYZ Foods",
      company: "XYZ Foods Industries",
      email: "info@xyz.com",
      phone: "0398765432",
      paymentTerms: "net15",
    });

    console.log("✅ Created 2 suppliers\n");

    // Create products
    console.log("📦 Creating products...");
    const products = await Product.create([
      {
        sku: "BEV-001",
        name: "Coca Cola 330ml",
        category: beverages._id,
        price: 2.5,
        cost: 1.5,
        stock: 100,
        lowStockThreshold: 20,
        supplier: supplier1._id,
        createdBy: admin._id,
      },
      {
        sku: "BEV-002",
        name: "Pepsi 330ml",
        category: beverages._id,
        price: 2.3,
        cost: 1.4,
        stock: 80,
        lowStockThreshold: 20,
        supplier: supplier1._id,
        createdBy: admin._id,
      },
      {
        sku: "BEV-003",
        name: "Sprite 330ml",
        category: beverages._id,
        price: 2.4,
        cost: 1.45,
        stock: 90,
        lowStockThreshold: 20,
        supplier: supplier1._id,
        createdBy: admin._id,
      },
      {
        sku: "BEV-004",
        name: "Mineral Water 500ml",
        category: beverages._id,
        price: 1.5,
        cost: 0.8,
        stock: 150,
        lowStockThreshold: 30,
        supplier: supplier1._id,
        createdBy: admin._id,
      },
      {
        sku: "SNK-001",
        name: "Lays Classic Chips",
        category: snacks._id,
        price: 4.5,
        cost: 3.0,
        stock: 5,
        lowStockThreshold: 10,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
      {
        sku: "SNK-002",
        name: "Pringles Original",
        category: snacks._id,
        price: 8.9,
        cost: 6.5,
        stock: 8,
        lowStockThreshold: 10,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
      {
        sku: "GRC-001",
        name: "White Bread",
        category: groceries._id,
        price: 3.2,
        cost: 2.0,
        stock: 25,
        lowStockThreshold: 10,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
      {
        sku: "GRC-002",
        name: "Eggs (10pcs)",
        category: groceries._id,
        price: 6.5,
        cost: 4.5,
        stock: 30,
        lowStockThreshold: 15,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
      {
        sku: "DRY-001",
        name: "Fresh Milk 1L",
        category: dairy._id,
        price: 7.8,
        cost: 5.5,
        stock: 20,
        lowStockThreshold: 10,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
      {
        sku: "DRY-002",
        name: "Cheddar Cheese 200g",
        category: dairy._id,
        price: 12.9,
        cost: 9.0,
        stock: 15,
        lowStockThreshold: 8,
        supplier: supplier2._id,
        createdBy: admin._id,
      },
    ]);

    console.log("✅ Created 10 products\n");

    // Create customers
    console.log("👤 Creating customers...");
    const customers = await Customer.create([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "0123456789",
        totalPurchases: 5,
        totalSpent: 125.5,
        loyaltyPoints: 125,
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "0198765432",
        totalPurchases: 3,
        totalSpent: 87.3,
        loyaltyPoints: 87,
      },
      {
        name: "Ahmad Ali",
        email: "ahmad@example.com",
        phone: "0187654321",
        totalPurchases: 8,
        totalSpent: 256.8,
        loyaltyPoints: 256,
      },
    ]);

    console.log("✅ Created 3 customers\n");

    // Create sample transactions
    console.log("💰 Creating sample transactions...");

    // Helper function to generate transaction number
    const generateTransactionNumber = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const random = Math.floor(Math.random() * 9000) + 1000;
      return `TRX-${year}${month}${day}-${random}`;
    };

    // Transaction 1 - Today
    const today = new Date();
    const transaction1 = new Transaction({
      transactionNumber: generateTransactionNumber(today),
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          quantity: 2,
          unitPrice: products[0].price,
          subtotal: products[0].price * 2,
        },
        {
          product: products[4]._id,
          productName: products[4].name,
          quantity: 1,
          unitPrice: products[4].price,
          subtotal: products[4].price * 1,
        },
      ],
      customer: customers[0]._id,
      subtotal: 9.5,
      discount: 0,
      tax: 0,
      totalAmount: 9.5,
      paymentMethod: "cash",
      amountPaid: 10.0,
      changeGiven: 0.5,
      cashier: cashier._id,
      status: "completed",
      createdAt: today,
    });
    await transaction1.save();

    // Transaction 2 - Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const transaction2 = new Transaction({
      transactionNumber: generateTransactionNumber(yesterday),
      items: [
        {
          product: products[1]._id,
          productName: products[1].name,
          quantity: 3,
          unitPrice: products[1].price,
          subtotal: products[1].price * 3,
        },
      ],
      customer: customers[1]._id,
      subtotal: 6.9,
      discount: 0,
      tax: 0,
      totalAmount: 6.9,
      paymentMethod: "card",
      amountPaid: 6.9,
      changeGiven: 0,
      cashier: cashier._id,
      status: "completed",
      createdAt: yesterday,
    });
    await transaction2.save();

    // Transaction 3 - 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const transaction3 = new Transaction({
      transactionNumber: generateTransactionNumber(twoDaysAgo),
      items: [
        {
          product: products[6]._id,
          productName: products[6].name,
          quantity: 2,
          unitPrice: products[6].price,
          subtotal: products[6].price * 2,
        },
        {
          product: products[8]._id,
          productName: products[8].name,
          quantity: 1,
          unitPrice: products[8].price,
          subtotal: products[8].price * 1,
        },
      ],
      customer: customers[2]._id,
      subtotal: 14.2,
      discount: 0,
      tax: 0,
      totalAmount: 14.2,
      paymentMethod: "ewallet",
      amountPaid: 14.2,
      changeGiven: 0,
      cashier: cashier._id,
      status: "completed",
      createdAt: twoDaysAgo,
    });
    await transaction3.save();

    console.log("✅ Created 3 transactions\n");

    // Summary
    console.log("═══════════════════════════════════════");
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════\n");

    console.log("📊 Summary:");
    console.log(`   Users: 3`);
    console.log(`   Categories: 4`);
    console.log(`   Products: 10`);
    console.log(`   Suppliers: 2`);
    console.log(`   Customers: 3`);
    console.log(`   Transactions: 3\n`);

    console.log("🔐 Login Credentials:");
    console.log("   Admin:    admin@test.com    / admin123");
    console.log("   Manager:  manager@test.com  / manager123");
    console.log("   Cashier:  cashier@test.com  / cashier123\n");

    console.log("🌐 You can now login at: http://localhost:5173\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
