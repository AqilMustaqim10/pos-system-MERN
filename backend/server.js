/**
 * ============================================
 * MAIN SERVER FILE
 * ============================================
 * This is the entry point of our backend application.
 * It initializes Express, connects to MongoDB, and starts the server.
 *
 * Think of this as the "main kitchen" that coordinates everything.
 */

// ============================================
// 1. IMPORT DEPENDENCIES
// ============================================
// Import required packages (like importing tools into your kitchen)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

// Import our custom files (we'll create these next)
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

// ============================================
// 2. LOAD ENVIRONMENT VARIABLES
// ============================================
// Load variables from .env file into process.env
// This must be done BEFORE using any environment variables
dotenv.config();

// ============================================
// 3. INITIALIZE EXPRESS APP
// ============================================
// Create an Express application instance
// Express is like the head chef that manages all requests
const app = express();

// ============================================
// 4. CONNECT TO DATABASE
// ============================================
// Establish connection to MongoDB
// This happens asynchronously (in the background)
connectDB();

// ============================================
// 5. MIDDLEWARE CONFIGURATION
// ============================================
// Middleware = Functions that run BEFORE your route handlers
// Think of them as prep cooks that prepare ingredients before cooking

// HELMET: Adds security headers to protect against common attacks
// (Like locking the kitchen doors)
app.use(helmet());

// CORS: Allows frontend from different domain to access this API
// Without this, browsers block requests from different origins
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies and authentication headers
  })
);

// BODY PARSERS: Convert incoming request data into usable format
app.use(express.json()); // Parse JSON data from request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// MONGO SANITIZE: Removes $ and . from user input to prevent NoSQL injection
// Example: Prevents {"$gt": ""} attacks in MongoDB queries
app.use(mongoSanitize());

// MORGAN: Logs all HTTP requests to console (helps with debugging)
// Only use in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Logs: GET /api/users 200 45.123 ms
}

// RATE LIMITING: Prevents abuse by limiting requests per IP
// If someone sends too many requests, they get blocked temporarily
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.MAX_REQUESTS || 100, // Max 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});
app.use("/api", limiter); // Apply to all /api routes

// ============================================
// 6. API ROUTES
// ============================================
// Define API endpoints (we'll create these route files next)
// Routes tell the server what to do when specific URLs are accessed

// Health check route (test if server is running)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running smoothly! 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Import route modules
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/analytics", analyticsRoutes);

// ============================================
// 7. 404 HANDLER (Route Not Found)
// ============================================
// This runs when someone tries to access a route that doesn't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// 8. ERROR HANDLING MIDDLEWARE
// ============================================
// This catches all errors that occur in the application
// Must be LAST middleware in the chain
app.use(errorHandler);

// ============================================
// 9. START SERVER
// ============================================
// Define port from environment variable or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start listening for requests
const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║                                                ║
  ║   🚀 SERVER RUNNING SUCCESSFULLY              ║
  ║                                                ║
  ║   📍 Port:        ${PORT}                          ║
  ║   🌍 Environment: ${process.env.NODE_ENV || "development"}              ║
  ║   📊 API:         http://localhost:${PORT}/api    ║
  ║   ❤️  Health:      http://localhost:${PORT}/api/health ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝
  `);
});

// ============================================
// 10. GRACEFUL SHUTDOWN
// ============================================
// Handle server shutdown gracefully (close connections properly)

// Handle unhandled promise rejections (async errors not caught)
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! Shutting down...");
  console.error("Error:", err.message);
  // Close server and exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal (server shutdown request)
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully...");
  server.close(() => {
    console.log("✅ Process terminated!");
  });
});

// Export app for testing purposes
export default app;

/**
 * ============================================
 * SUMMARY - WHAT HAPPENS WHEN SERVER STARTS:
 * ============================================
 *
 * 1. Load environment variables from .env
 * 2. Create Express app
 * 3. Connect to MongoDB database
 * 4. Setup security middleware (helmet, CORS, sanitization)
 * 5. Setup body parsing (to read JSON/form data)
 * 6. Setup request logging (morgan)
 * 7. Setup rate limiting (prevent abuse)
 * 8. Define API routes
 * 9. Setup error handling
 * 10. Start listening on specified PORT
 *
 * ============================================
 * HOW TO RUN:
 * ============================================
 *
 * Development (auto-restart on changes):
 *   npm run dev
 *
 * Production:
 *   npm start
 *
 * Testing:
 *   npm test
 */
