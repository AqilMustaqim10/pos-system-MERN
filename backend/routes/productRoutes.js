import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  validateProductCreate,
  validateMongoId,
} from "../middleware/validationMiddleware.js";
import { activityLoggerMiddleware } from "../middleware/activityLogger.js";

const router = express.Router();

// Special routes first (before /:id)
router.get("/alerts/low-stock", protect, getLowStockProducts);

// Main CRUD routes
router
  .route("/")
  .get(protect, getProducts)
  .post(
    protect,
    authorize("admin", "manager"),
    validateProductCreate,
    activityLoggerMiddleware("product", "create"),
    createProduct
  );

router
  .route("/:id")
  .get(protect, validateMongoId, getProduct)
  .put(
    protect,
    authorize("admin", "manager"),
    validateMongoId,
    activityLoggerMiddleware("product", "update"),
    updateProduct
  )
  .delete(
    protect,
    authorize("admin"),
    validateMongoId,
    activityLoggerMiddleware("product", "delete"),
    deleteProduct
  );

export default router;
