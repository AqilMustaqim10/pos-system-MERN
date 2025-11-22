import Supplier from "../models/Supplier.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
export const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find().sort("-createdAt");

  res.status(200).json({
    success: true,
    count: suppliers.length,
    data: suppliers,
  });
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  res.status(200).json({
    success: true,
    data: supplier,
  });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Manager)
export const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(req.body);

  res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    data: supplier,
  });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Manager)
export const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    data: supplier,
  });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  await supplier.deleteOne();

  res.status(200).json({
    success: true,
    message: "Supplier deleted successfully",
  });
});
