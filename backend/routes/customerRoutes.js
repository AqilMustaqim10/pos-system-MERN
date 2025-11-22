import express from "express";
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCustomers).post(protect, createCustomer);

router
  .route("/:id")
  .get(protect, getCustomer)
  .put(protect, updateCustomer)
  .delete(protect, authorize("admin", "manager"), deleteCustomer);

export default router;
