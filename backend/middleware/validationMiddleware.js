import { body, param, validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

// Validation result checker
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
    throw new AppError(errorMessages, 400);
  }
  next();
};

// User validations
export const validateUserCreate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["admin", "manager", "cashier"])
    .withMessage("Role must be admin, manager, or cashier"),

  validate,
];

export const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["admin", "manager", "cashier"])
    .withMessage("Role must be admin, manager, or cashier"),

  validate,
];

// Product validations
export const validateProductCreate = [
  body("sku").trim().notEmpty().withMessage("SKU is required").toUpperCase(),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a positive integer"),

  validate,
];

// Category validations
export const validateCategoryCreate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  validate,
];

// Transaction validations
export const validateTransactionCreate = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Transaction must have at least one item"),

  body("items.*.product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("paymentMethod")
    .notEmpty()
    .withMessage("Payment method is required")
    .isIn(["cash", "card", "ewallet", "bank_transfer"])
    .withMessage("Invalid payment method"),

  validate,
];

// Stock adjustment validations
export const validateStockAdjustment = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),

  body("type")
    .notEmpty()
    .withMessage("Adjustment type is required")
    .isIn(["in", "out", "adjustment", "damaged", "return"])
    .withMessage("Invalid adjustment type"),

  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ max: 200 })
    .withMessage("Reason cannot exceed 200 characters"),

  validate,
];

// Customer validations
export const validateCustomerCreate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  validate,
];

// MongoDB ID validation
export const validateMongoId = [
  param("id").isMongoId().withMessage("Invalid ID format"),

  validate,
];
