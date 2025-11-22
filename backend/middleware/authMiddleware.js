import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "./asyncHandler.js";
import { AppError } from "./errorHandler.js";

// Protect routes - check if user is authenticated
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    throw new AppError("Not authorized to access this route", 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw new AppError("User not found", 404);
    }

    // Check if user is active
    if (!req.user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    next();
  } catch (error) {
    throw new AppError("Not authorized to access this route", 401);
  }
});

// Check user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};
