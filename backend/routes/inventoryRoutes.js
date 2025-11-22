import express from "express";
import {
  adjustStock,
  getAdjustments,
  getInventoryOverview,
  getReorderList,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/adjust", protect, authorize("admin", "manager"), adjustStock);
router.get("/adjustments", protect, getAdjustments);
router.get("/overview", protect, getInventoryOverview);
router.get("/reorder", protect, getReorderList);

export default router;
