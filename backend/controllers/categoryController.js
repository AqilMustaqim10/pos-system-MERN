import Category from "../models/Category.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin, Manager)
export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin, Manager)
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Return updated document
    runValidators: true, // Run schema validation
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
