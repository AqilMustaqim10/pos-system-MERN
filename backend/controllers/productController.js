import Product from "../models/Product.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = { ...req.query };
  const excludeFields = ["page", "sort", "limit", "fields", "search"];
  excludeFields.forEach((field) => delete queryObj[field]);

  // Search functionality
  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { sku: { $regex: req.query.search, $options: "i" } },
    ];
  }

  // Filter by category
  if (req.query.category) {
    queryObj.category = req.query.category;
  }

  // Filter by low stock
  if (req.query.lowStock === "true") {
    queryObj.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
  }

  // Execute query
  let query = Product.find(queryObj).populate("category", "name");

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments(queryObj);

  query = query.skip(startIndex).limit(limit);

  const products = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pagination,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("supplier", "name company");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin, Manager)
export const createProduct = asyncHandler(async (req, res) => {
  // Add user who created
  req.body.createdBy = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
export const updateProduct = asyncHandler(async (req, res) => {
  // Add user who updated
  req.body.updatedBy = req.user.id;

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("category", "name");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Get low stock products
// @route   GET /api/products/alerts/low-stock
// @access  Private
export const getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  })
    .populate("category", "name")
    .sort({ stock: 1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
