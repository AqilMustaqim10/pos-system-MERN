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

const router = express.Router();

// Special routes first (before /:id)
router.get("/alerts/low-stock", protect, getLowStockProducts);

// Main CRUD routes
router
  .route("/")
  .get(protect, getProducts)
  .post(protect, authorize("admin", "manager"), createProduct);

router
  .route("/:id")
  .get(protect, getProduct)
  .put(protect, authorize("admin", "manager"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

export default router;
