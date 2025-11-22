import express from "express";
import {
  getActivityLogs,
  getUserActivity,
  getActivitySummary,
} from "../controllers/activityLogController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "manager"), getActivityLogs);
router.get("/summary", authorize("admin", "manager"), getActivitySummary);
router.get("/user/:userId", getUserActivity);

export default router;
