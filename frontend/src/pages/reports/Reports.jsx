import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, TrendingUp, Package, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import analyticsService from "../../services/analyticsService";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

const Reports = () => {
  const [period, setPeriod] = useState("day");

  // Fetch sales report
  const { data: salesData, isLoading: loadingSales } = useQuery({
    queryKey: ["sales-report", period],
    queryFn: () => analyticsService.getSalesReport({ groupBy: period }),
  });

  // Fetch top products
  const { data: topProductsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: () => analyticsService.getTopProducts(10),
  });

  // Fetch revenue by category
  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ["revenue-by-category"],
    queryFn: analyticsService.getRevenueByCategory,
  });

  const salesReport = salesData?.data || [];
  const topProducts = topProductsData?.data || [];
  const categoryRevenue = categoryData?.data || [];

  // Calculate totals
  const totalRevenue = salesReport.reduce((sum, item) => sum + item.revenue, 0);
  const totalTransactions = salesReport.reduce(
    (sum, item) => sum + item.transactions,
    0
  );
  const totalItems = salesReport.reduce((sum, item) => sum + item.items, 0);

  // Colors for pie chart
  const COLORS = [
    "#0ea5e9",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  // Export to CSV
  const exportToCSV = () => {
    const csvData = [
      ["Date", "Revenue", "Transactions", "Items"],
      ...salesReport.map((item) => [
        item.date,
        item.revenue,
        item.transactions,
        item.items,
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const periodOptions = [
    { value: "day", label: "Daily" },
    { value: "month", label: "Monthly" },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your sales performance</p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  RM {totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalTransactions}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items Sold</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sales Trend Chart */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={periodOptions}
              className="w-32"
            />
          </div>

          {loadingSales ? (
            <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Revenue (RM)"
                />
                <Line
                  type="monotone"
                  dataKey="transactions"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Transactions"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Selling Products
            </h3>
            {loadingProducts ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="productName"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="totalQuantity"
                    fill="#0ea5e9"
                    name="Quantity Sold"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Revenue by Category */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Category
            </h3>
            {loadingCategories ? (
              <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) =>
                      `${entry.category}: RM ${entry.revenue.toFixed(0)}`
                    }
                  >
                    {categoryRevenue.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
