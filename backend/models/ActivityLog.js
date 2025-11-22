import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "view",
        "export",
        "import",
      ],
    },
    entity: {
      type: String, // What was affected: 'product', 'user', 'transaction', etc
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId, // ID of affected document
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed, // Store what changed
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
