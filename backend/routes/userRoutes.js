import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  toggleUserStatus,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  validateUserCreate,
  validateUserUpdate,
  validateMongoId,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Special routes
router.put("/:id/change-password", validateMongoId, changePassword);
router.put(
  "/:id/toggle-status",
  validateMongoId,
  authorize("admin", "manager"),
  toggleUserStatus
);

// Main CRUD routes
router
  .route("/")
  .get(authorize("admin", "manager"), getUsers)
  .post(authorize("admin", "manager"), validateUserCreate, createUser);

router
  .route("/:id")
  .get(validateMongoId, getUser)
  .put(validateMongoId, validateUserUpdate, updateUser)
  .delete(validateMongoId, authorize("admin"), deleteUser);

export default router;
