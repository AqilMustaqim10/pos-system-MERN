import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
export const getUsers = asyncHandler(async (req, res) => {
  // Search functionality
  const search = req.query.search;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by status
  if (req.query.isActive) {
    query.isActive = req.query.isActive === "true";
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .sort("-createdAt")
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    data: users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin, Manager, or Own Profile)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Only allow admin/manager or own profile
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.id !== req.params.id
  ) {
    throw new AppError("Not authorized to access this user", 403);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Create user (Register staff)
// @route   POST /api/users
// @access  Private (Admin, Manager)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User with this email already exists", 400);
  }

  // Only admin can create admin users
  if (role === "admin" && req.user.role !== "admin") {
    throw new AppError("Only admin can create admin users", 403);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "cashier",
    phone,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin, Manager, or Own Profile)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check permissions
  const isOwnProfile = req.user.id === req.params.id;
  const isAdmin = req.user.role === "admin";
  const isManager = req.user.role === "manager";

  if (!isAdmin && !isManager && !isOwnProfile) {
    throw new AppError("Not authorized to update this user", 403);
  }

  // Only admin can change role
  if (req.body.role && !isAdmin) {
    throw new AppError("Only admin can change user role", 403);
  }

  // Only admin can change admin role
  if (req.body.role === "admin" && !isAdmin) {
    throw new AppError("Only admin can create admin users", 403);
  }

  // Don't allow password update here (use change password endpoint)
  if (req.body.password) {
    delete req.body.password;
  }

  // Update allowed fields
  const allowedFields = ["name", "email", "phone", "avatar"];
  if (isAdmin || isManager) {
    allowedFields.push("role", "isActive");
  }

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Can't delete yourself
  if (req.user.id === req.params.id) {
    throw new AppError("Cannot delete your own account", 400);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Change password
// @route   PUT /api/users/:id/change-password
// @access  Private (Admin or Own Profile)
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  const user = await User.findById(req.params.id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Only allow admin or own profile
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    throw new AppError("Not authorized to change this password", 403);
  }

  // Verify current password (unless admin changing other's password)
  if (req.user.id === req.params.id) {
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// @desc    Toggle user status (activate/deactivate)
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin, Manager)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Can't deactivate yourself
  if (req.user.id === req.params.id) {
    throw new AppError("Cannot deactivate your own account", 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: {
      id: user._id,
      name: user.name,
      isActive: user.isActive,
    },
  });
});
