import Product from "../models/Product.js";
import StockAdjustment from "../models/StockAdjustment.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Adjust product stock
// @route   POST /api/inventory/adjust
// @access  Private (Admin, Manager)
export const adjustStock = asyncHandler(async (req, res) => {
  const { product, type, quantity, reason, reference } = req.body;

  // Validate input
  if (!product || !type || !quantity || !reason) {
    throw new AppError(
      "Please provide product, type, quantity, and reason",
      400
    );
  }

  // Get product
  const productDoc = await Product.findById(product);

  if (!productDoc) {
    throw new AppError("Product not found", 404);
  }

  const previousStock = productDoc.stock;
  let newStock;

  // Calculate new stock based on type
  switch (type) {
    case "in": // Add stock
    case "return": // Customer return
      newStock = previousStock + quantity;
      break;

    case "out": // Remove stock
    case "damaged": // Damaged items
      if (previousStock < quantity) {
        throw new AppError("Insufficient stock for this adjustment", 400);
      }
      newStock = previousStock - quantity;
      break;

    case "adjustment": // Manual adjustment (can be + or -)
      newStock = quantity; // Set to absolute value
      break;

    default:
      throw new AppError("Invalid adjustment type", 400);
  }

  // Create stock adjustment record
  const adjustment = await StockAdjustment.create({
    product: productDoc._id,
    type,
    quantity,
    previousStock,
    newStock,
    reason,
    reference,
    adjustedBy: req.user.id,
  });

  // Update product stock
  productDoc.stock = newStock;
  await productDoc.save();

  // Populate and return
  const populatedAdjustment = await StockAdjustment.findById(adjustment._id)
    .populate("product", "name sku")
    .populate("adjustedBy", "name");

  res.status(201).json({
    success: true,
    message: "Stock adjusted successfully",
    data: populatedAdjustment,
  });
});

// @desc    Get stock adjustment history
// @route   GET /api/inventory/adjustments
// @access  Private
export const getAdjustments = asyncHandler(async (req, res) => {
  // Build query
  const query = {};

  if (req.query.product) {
    query.product = req.query.product;
  }

  if (req.query.type) {
    query.type = req.query.type;
  }

  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const total = await StockAdjustment.countDocuments(query);
  const adjustments = await StockAdjustment.find(query)
    .populate("product", "name sku")
    .populate("adjustedBy", "name")
    .sort("-createdAt")
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: adjustments.length,
    total,
    data: adjustments,
  });
});

// @desc    Get inventory overview
// @route   GET /api/inventory/overview
// @access  Private
export const getInventoryOverview = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true });

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  ).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  const totalStockValue = products.reduce((sum, p) => {
    return sum + p.stock * p.price;
  }, 0);

  const totalCostValue = products.reduce((sum, p) => {
    return sum + p.stock * (p.cost || 0);
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue: totalStockValue.toFixed(2),
      totalCostValue: totalCostValue.toFixed(2),
      estimatedProfit: (totalStockValue - totalCostValue).toFixed(2),
    },
  });
});

// @desc    Get products needing reorder
// @route   GET /api/inventory/reorder
// @access  Private
export const getReorderList = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .populate("category", "name")
    .populate("supplier", "name company phone")
    .sort({ stock: 1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
