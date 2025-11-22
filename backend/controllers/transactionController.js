import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Create new transaction (Process sale)
// @route   POST /api/transactions
// @access  Private
export const createTransaction = asyncHandler(async (req, res) => {
  const { items, customer, discount, tax, paymentMethod, amountPaid } =
    req.body;

  // Validate items exist
  if (!items || items.length === 0) {
    throw new AppError("Please add items to transaction", 400);
  }

  // Process each item and check stock
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }

    if (!product.isActive) {
      throw new AppError(`Product ${product.name} is not available`, 400);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        400
      );
    }

    // Calculate item subtotal
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;

    // Prepare item for transaction
    processedItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: itemSubtotal,
    });

    // Deduct stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Calculate totals
  const discountAmount = discount || 0;
  const taxAmount = tax || 0;
  const totalAmount = subtotal - discountAmount + taxAmount;

  // Calculate change
  const paidAmount = amountPaid || totalAmount;
  const changeGiven = paidAmount - totalAmount;

  // Create transaction
  const transaction = await Transaction.create({
    items: processedItems,
    customer,
    subtotal,
    discount: discountAmount,
    tax: taxAmount,
    totalAmount,
    paymentMethod,
    amountPaid: paidAmount,
    changeGiven: changeGiven > 0 ? changeGiven : 0,
    cashier: req.user.id,
    status: "completed",
  });

  // Update customer if provided
  if (customer) {
    await Customer.findByIdAndUpdate(customer, {
      $inc: {
        totalPurchases: 1,
        totalSpent: totalAmount,
        loyaltyPoints: Math.floor(totalAmount), // 1 point per RM
      },
    });
  }

  // Populate and return
  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate("items.product", "name sku")
    .populate("customer", "name phone")
    .populate("cashier", "name");

  res.status(201).json({
    success: true,
    message: "Transaction completed successfully",
    data: populatedTransaction,
  });
});

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  // Date filter
  const query = {};

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Filter by cashier
  if (req.query.cashier) {
    query.cashier = req.query.cashier;
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .populate("customer", "name phone")
    .populate("cashier", "name")
    .sort("-createdAt")
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    data: transactions,
  });
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("items.product", "name sku")
    .populate("customer", "name phone email")
    .populate("cashier", "name email");

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

// @desc    Get daily sales summary
// @route   GET /api/transactions/reports/daily
// @access  Private
export const getDailySales = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const transactions = await Transaction.find({
    createdAt: { $gte: today, $lt: tomorrow },
    status: "completed",
  });

  const summary = {
    date: today,
    totalTransactions: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
    totalDiscount: transactions.reduce((sum, t) => sum + t.discount, 0),
    paymentMethods: {},
  };

  // Group by payment method
  transactions.forEach((t) => {
    if (!summary.paymentMethods[t.paymentMethod]) {
      summary.paymentMethods[t.paymentMethod] = {
        count: 0,
        total: 0,
      };
    }
    summary.paymentMethods[t.paymentMethod].count++;
    summary.paymentMethods[t.paymentMethod].total += t.totalAmount;
  });

  res.status(200).json({
    success: true,
    data: summary,
  });
});

// @desc    Cancel transaction (refund)
// @route   PUT /api/transactions/:id/cancel
// @access  Private (Admin, Manager)
export const cancelTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  if (transaction.status === "cancelled") {
    throw new AppError("Transaction already cancelled", 400);
  }

  // Restore stock for each item
  for (const item of transaction.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  // Update customer stats if customer exists
  if (transaction.customer) {
    await Customer.findByIdAndUpdate(transaction.customer, {
      $inc: {
        totalPurchases: -1,
        totalSpent: -transaction.totalAmount,
        loyaltyPoints: -Math.floor(transaction.totalAmount),
      },
    });
  }

  // Update transaction status
  transaction.status = "cancelled";
  await transaction.save();

  res.status(200).json({
    success: true,
    message: "Transaction cancelled and stock restored",
    data: transaction,
  });
});
