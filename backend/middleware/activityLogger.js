import ActivityLog from "../models/ActivityLog.js";

// Log activity helper function
export const logActivity = async ({
  user,
  action,
  entity,
  entityId,
  description,
  changes,
  req,
}) => {
  try {
    await ActivityLog.create({
      user,
      action,
      entity,
      entityId,
      description,
      changes,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers["user-agent"],
    });
  } catch (error) {
    console.error("Activity logging failed:", error.message);
  }
};

// Middleware to log successful operations
export const activityLoggerMiddleware = (entity, action) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method
    res.json = function (data) {
      // Only log successful operations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
        // Determine entity ID
        let entityId = null;
        if (data.data && data.data._id) {
          entityId = data.data._id;
        } else if (data.data && data.data.id) {
          entityId = data.data.id;
        } else if (req.params.id) {
          entityId = req.params.id;
        }

        // Create description
        let description = `${action} ${entity}`;
        if (data.data && data.data.name) {
          description += `: ${data.data.name}`;
        } else if (data.data && data.data.transactionNumber) {
          description += `: ${data.data.transactionNumber}`;
        }

        // Log activity (don't wait)
        logActivity({
          user: req.user?.id,
          action,
          entity,
          entityId,
          description,
          changes: req.method === "PUT" ? req.body : null,
          req,
        });
      }

      // Call original json
      return originalJson(data);
    };

    next();
  };
};
