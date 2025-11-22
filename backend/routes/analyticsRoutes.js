import express from "express";
import {
  getDashboardOverview,
  getSalesReport,
  getTopProducts,
  getRevenueByCategory,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardOverview);
router.get("/sales", protect, getSalesReport);
router.get("/top-products", protect, getTopProducts);
router.get("/revenue-by-category", protect, getRevenueByCategory);

export default router;
