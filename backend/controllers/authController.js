import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (or Admin only - you can change this)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password, // Will be hashed automatically by pre-save hook
    role: role || "cashier",
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  // Check if user exists and password matches
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError("Your account has been deactivated", 403);
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
