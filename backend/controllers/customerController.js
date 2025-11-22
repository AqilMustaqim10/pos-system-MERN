import Customer from "../models/Customer.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = asyncHandler(async (req, res) => {
  // Search functionality
  const search = req.query.search;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .sort("-createdAt")
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: customers.length,
    total,
    data: customers,
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  res.status(200).json({
    success: true,
    data: customer,
  });
});

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create(req.body);

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Manager)
export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  await customer.deleteOne();

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
});
