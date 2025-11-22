import ActivityLog from "../models/ActivityLog.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Create activity log
// @route   POST /api/activity-logs
// @access  Private (used internally by system)
export const createActivityLog = async (data) => {
  try {
    await ActivityLog.create(data);
  } catch (error) {
    console.error("Failed to create activity log:", error.message);
  }
};

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private (Admin, Manager)
export const getActivityLogs = asyncHandler(async (req, res) => {
  // Build query
  const query = {};

  // Filter by user
  if (req.query.user) {
    query.user = req.query.user;
  }

  // Filter by action
  if (req.query.action) {
    query.action = req.query.action;
  }

  // Filter by entity
  if (req.query.entity) {
    query.entity = req.query.entity;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;

  const total = await ActivityLog.countDocuments(query);
  const logs = await ActivityLog.find(query)
    .populate("user", "name email role")
    .sort("-createdAt")
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    data: logs,
  });
});

// @desc    Get user activity
// @route   GET /api/activity-logs/user/:userId
// @access  Private (Admin, Manager, or Own Activity)
export const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check permission
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    req.user.id !== userId
  ) {
    throw new AppError("Not authorized to view this activity", 403);
  }

  const logs = await ActivityLog.find({ user: userId })
    .sort("-createdAt")
    .limit(100);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Get activity summary
// @route   GET /api/activity-logs/summary
// @access  Private (Admin, Manager)
export const getActivitySummary = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count activities by action type today
  const todayStats = await ActivityLog.aggregate([
    { $match: { createdAt: { $gte: today } } },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
      },
    },
  ]);

  // Most active users today
  const activeUsers = await ActivityLog.aggregate([
    { $match: { createdAt: { $gte: today } } },
    {
      $group: {
        _id: "$user",
        activityCount: { $sum: 1 },
      },
    },
    { $sort: { activityCount: -1 } },
    { $limit: 5 },
  ]);

  // Populate user details
  await ActivityLog.populate(activeUsers, {
    path: "_id",
    select: "name email role",
  });

  res.status(200).json({
    success: true,
    data: {
      todayStats,
      activeUsers,
    },
  });
});
