/**
 * ============================================
 * ASYNC HANDLER FUNCTION
 * ============================================
 * Wraps async route handlers to catch errors automatically
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => {
  // Return a new function that Express will call
  return (req, res, next) => {
    // Execute the async function and catch any errors
    // If error occurs, pass it to next() which triggers error handler
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;

/**
 * ============================================
 * HOW IT WORKS (EXPLAINED SIMPLY):
 * ============================================
 *
 * 1. You write your async route handler normally
 * 2. Wrap it with asyncHandler()
 * 3. If an error occurs, it's automatically caught
 * 4. Error is passed to your error handler middleware
 * 5. Error handler sends appropriate response to client
 *
 * ============================================
 * EXAMPLE USAGE IN ROUTES:
 * ============================================
 */

// Example 1: Get all products
// export const getProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find();
//
//   res.status(200).json({
//     success: true,
//     count: products.length,
//     data: products
//   });
// });

// Example 2: Get single product with error handling
// export const getProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);
//
//   // If product not found, throw error (asyncHandler will catch it)
//   if (!product) {
//     throw new AppError('Product not found', 404);
//   }
//
//   res.status(200).json({
//     success: true,
//     data: product
//   });
// });

// Example 3: Create product with validation
// export const createProduct = asyncHandler(async (req, res) => {
//   // If validation fails, Mongoose throws error
//   // asyncHandler catches it and sends to error handler
//   const product = await Product.create(req.body);
//
//   res.status(201).json({
//     success: true,
//     data: product
//   });
// });

// Example 4: Update product
// export const updateProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findByIdAndUpdate(
//     req.params.id,
//     req.body,
//     {
//       new: true,           // Return updated document
//       runValidators: true  // Run schema validators
//     }
//   );
//
//   if (!product) {
//     throw new AppError('Product not found', 404);
//   }
//
//   res.status(200).json({
//     success: true,
//     data: product
//   });
// });

// Example 5: Delete product
// export const deleteProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//
//   if (!product) {
//     throw new AppError('Product not found', 404);
//   }
//
//   res.status(200).json({
//     success: true,
//     message: 'Product deleted successfully'
//   });
// });

/**
 * ============================================
 * TECHNICAL BREAKDOWN:
 * ============================================
 *
 * Let's break down the asyncHandler function line by line:
 *
 * const asyncHandler = (fn) => {
 *   // fn is your async route handler function
 *
 *   return (req, res, next) => {
 *     // Return a standard Express middleware function
 *     // Express will call this with req, res, next
 *
 *     Promise.resolve(fn(req, res, next))
 *     // Execute fn and ensure it returns a Promise
 *     // Even if fn returns a value, Promise.resolve wraps it
 *
 *     .catch(next);
 *     // If Promise rejects (error occurs), catch it
 *     // Pass error to next() which triggers error handler
 *   };
 * };
 *
 * ============================================
 * BENEFITS:
 * ============================================
 *
 * ✅ Cleaner code (no repetitive try-catch blocks)
 * ✅ Consistent error handling
 * ✅ Less boilerplate code
 * ✅ Easier to read and maintain
 * ✅ All errors automatically reach error handler
 *
 * ============================================
 * IMPORTANT NOTES:
 * ============================================
 *
 * 1. Only use with ASYNC functions
 * 2. Errors are caught and passed to error handler
 * 3. You can still throw custom errors with AppError
 * 4. Mongoose validation errors are caught automatically
 * 5. Database connection errors are caught too
 */
