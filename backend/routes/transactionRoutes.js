import express from "express";
import {
  createTransaction,
  getTransactions,
  getTransaction,
  getDailySales,
  cancelTransaction,
} from "../controllers/transactionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Special routes
router.get("/reports/daily", protect, getDailySales);

// Main routes
router
  .route("/")
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.get("/:id", protect, getTransaction);
router.put(
  "/:id/cancel",
  protect,
  authorize("admin", "manager"),
  cancelTransaction
);

export default router;
