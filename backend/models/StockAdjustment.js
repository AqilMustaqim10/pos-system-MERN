import mongoose from "mongoose";

const stockAdjustmentSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "damaged", "return"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      maxlength: [200, "Reason cannot exceed 200 characters"],
    },
    reference: {
      type: String, // Can be transaction ID, supplier invoice, etc
      trim: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const StockAdjustment = mongoose.model(
  "StockAdjustment",
  stockAdjustmentSchema
);

export default StockAdjustment;
