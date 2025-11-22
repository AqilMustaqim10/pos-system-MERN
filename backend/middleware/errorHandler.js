/**
 * ============================================
 * CUSTOM ERROR CLASS
 * ============================================
 * Extends the built-in Error class to add statusCode property
 * This allows us to throw errors with HTTP status codes
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call parent Error constructor
    this.statusCode = statusCode; // HTTP status code (400, 404, 500, etc.)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Flag to identify operational errors

    // Capture stack trace (helps with debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * ============================================
 * ERROR HANDLER MIDDLEWARE
 * ============================================
 * This function runs whenever an error occurs anywhere in the app
 *
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // ============================================
  // 1. SET DEFAULT VALUES
  // ============================================
  // If error doesn't have statusCode, assume 500 (Internal Server Error)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // ============================================
  // 2. LOG ERROR (Development Only)
  // ============================================
  // In development, log full error details to help debugging
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 ERROR OCCURRED:");
    console.error("Message:", err.message);
    console.error("Status Code:", err.statusCode);
    console.error("Stack:", err.stack);
  }

  // ============================================
  // 3. HANDLE SPECIFIC ERROR TYPES
  // ============================================
  // Different types of errors need different handling

  // MONGOOSE CAST ERROR (Invalid MongoDB ObjectId)
  // Example: /api/products/invalid_id_format
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    err = new AppError(message, 400); // 400 = Bad Request
  }

  // MONGOOSE DUPLICATE KEY ERROR (Unique field violation)
  // Example: Trying to create user with existing email
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // Get field name
    const value = err.keyValue[field]; // Get field value
    const message = `${field} '${value}' already exists. Please use another ${field}.`;
    err = new AppError(message, 400);
  }

  // MONGOOSE VALIDATION ERROR (Schema validation failed)
  // Example: Missing required fields, invalid format
  if (err.name === "ValidationError") {
    // Extract all validation error messages
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    err = new AppError(message, 400);
  }

  // JWT INVALID TOKEN ERROR
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    err = new AppError(message, 401); // 401 = Unauthorized
  }

  // JWT EXPIRED TOKEN ERROR
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    err = new AppError(message, 401);
  }

  // ============================================
  // 4. SEND ERROR RESPONSE
  // ============================================

  // DEVELOPMENT MODE - Send detailed error info
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack, // Full error stack trace
    });
  }
  // PRODUCTION MODE - Send minimal error info (don't expose internals)
  else {
    // Only send error details for operational errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
      });
    }
    // For programming errors, send generic message
    else {
      console.error("💥 NON-OPERATIONAL ERROR:", err);

      res.status(500).json({
        success: false,
        status: "error",
        message: "Something went wrong. Please try again later.",
      });
    }
  }
};

// Export both error handler and custom error class
export { errorHandler as default, AppError };

/**
 * ============================================
 * HOW TO USE AppError IN YOUR CODE:
 * ============================================
 *
 * Example 1: Product not found
 * if (!product) {
 *   throw new AppError('Product not found', 404);
 * }
 *
 * Example 2: Unauthorized access
 * if (!user.isAdmin) {
 *   throw new AppError('You do not have permission to perform this action', 403);
 * }
 *
 * Example 3: Missing required field
 * if (!req.body.email) {
 *   throw new AppError('Email is required', 400);
 * }
 *
 * ============================================
 * COMMON HTTP STATUS CODES:
 * ============================================
 *
 * 200 - OK (Success)
 * 201 - Created (Resource created successfully)
 * 400 - Bad Request (Invalid input)
 * 401 - Unauthorized (Not logged in or invalid token)
 * 403 - Forbidden (Logged in but no permission)
 * 404 - Not Found (Resource doesn't exist)
 * 409 - Conflict (Duplicate resource)
 * 422 - Unprocessable Entity (Validation error)
 * 500 - Internal Server Error (Server-side error)
 *
 * ============================================
 * ASYNC ERROR HANDLING:
 * ============================================
 *
 * For async route handlers, use try-catch or wrapper:
 *
 * Option 1: Try-Catch
 * app.get('/api/products', async (req, res, next) => {
 *   try {
 *     const products = await Product.find();
 *     res.json({ products });
 *   } catch (error) {
 *     next(error); // Pass error to error handler
 *   }
 * });
 *
 * Option 2: Async Handler Wrapper (we'll create this next)
 * app.get('/api/products', asyncHandler(async (req, res) => {
 *   const products = await Product.find();
 *   res.json({ products });
 * }));
 */
