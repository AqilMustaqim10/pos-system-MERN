import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Get dashboard overview
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Today's sales
  const todayTransactions = await Transaction.find({
    createdAt: { $gte: today },
    status: "completed",
  });

  const todayRevenue = todayTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );
  const todayTransactionsCount = todayTransactions.length;

  // This month's sales
  const monthTransactions = await Transaction.find({
    createdAt: { $gte: thisMonth },
    status: "completed",
  });

  const monthRevenue = monthTransactions.reduce(
    (sum, t) => sum + t.totalAmount,
    0
  );

  // Product stats
  const totalProducts = await Product.countDocuments({ isActive: true });
  const lowStockCount = await Product.countDocuments({
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] },
  });

  // Customer stats
  const totalCustomers = await Customer.countDocuments({ isActive: true });

  res.status(200).json({
    success: true,
    data: {
      today: {
        revenue: todayRevenue.toFixed(2),
        transactions: todayTransactionsCount,
      },
      thisMonth: {
        revenue: monthRevenue.toFixed(2),
        transactions: monthTransactions.length,
      },
      inventory: {
        totalProducts,
        lowStockProducts: lowStockCount,
      },
      customers: {
        total: totalCustomers,
      },
    },
  });
});

// @desc    Get sales report
// @route   GET /api/analytics/sales
// @access  Private
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = "day" } = req.query;

  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate
    ? new Date(startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const transactions = await Transaction.find({
    createdAt: { $gte: start, $lte: end },
    status: "completed",
  }).sort("createdAt");

  // Group data
  const groupedData = {};

  transactions.forEach((t) => {
    let key;
    const date = new Date(t.createdAt);

    if (groupBy === "day") {
      key = date.toISOString().split("T")[0];
    } else if (groupBy === "month") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    }

    if (!groupedData[key]) {
      groupedData[key] = {
        date: key,
        revenue: 0,
        transactions: 0,
        items: 0,
      };
    }

    groupedData[key].revenue += t.totalAmount;
    groupedData[key].transactions += 1;
    groupedData[key].items += t.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  });

  const report = Object.values(groupedData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  res.status(200).json({
    success: true,
    period: { start, end },
    data: report,
  });
});

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  // Aggregate to get top products
  const topProducts = await Transaction.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        productName: { $first: "$items.productName" },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
  ]);

  // Populate product details
  await Product.populate(topProducts, {
    path: "_id",
    select: "name sku price stock",
  });

  res.status(200).json({
    success: true,
    count: topProducts.length,
    data: topProducts,
  });
});

// @desc    Get revenue by category
// @route   GET /api/analytics/revenue-by-category
// @access  Private
export const getRevenueByCategory = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ status: "completed" }).populate(
    {
      path: "items.product",
      select: "category",
      populate: { path: "category", select: "name" },
    }
  );

  const categoryRevenue = {};

  transactions.forEach((t) => {
    t.items.forEach((item) => {
      if (item.product && item.product.category) {
        const categoryName = item.product.category.name;

        if (!categoryRevenue[categoryName]) {
          categoryRevenue[categoryName] = {
            category: categoryName,
            revenue: 0,
            items: 0,
          };
        }

        categoryRevenue[categoryName].revenue += item.subtotal;
        categoryRevenue[categoryName].items += item.quantity;
      }
    });
  });

  const result = Object.values(categoryRevenue).sort(
    (a, b) => b.revenue - a.revenue
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});
