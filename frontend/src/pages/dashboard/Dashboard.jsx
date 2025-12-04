import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Package, Users, AlertTriangle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import analyticsService from "../../services/analyticsService";
import transactionService from "../../services/transactionService";
import productService from "../../services/productService";
import Layout from "../../components/layout/Layout";
import StatCard from "../../components/dashboard/StatCard";
import SalesChart from "../../components/dashboard/SalesChart";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import LowStockAlert from "../../components/dashboard/LowStockAlert";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: analyticsService.getDashboard,
  });

  // Fetch sales report (last 7 days)
  const { data: salesData, isLoading: loadingSales } = useQuery({
    queryKey: ["sales-report"],
    queryFn: () => analyticsService.getSalesReport({ groupBy: "day" }),
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => transactionService.getAll({ limit: 5 }),
  });

  // Fetch low stock products
  const { data: lowStockData, isLoading: loadingLowStock } = useQuery({
    queryKey: ["low-stock"],
    queryFn: productService.getLowStock,
  });

  const stats = dashboardData?.data || {};
  const salesChartData = salesData?.data || [];
  const transactions = transactionsData?.data || [];
  const lowStockProducts = lowStockData?.data || [];

  return (
    <Layout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Sales"
            value={`RM ${stats.today?.revenue || "0.00"}`}
            icon={TrendingUp}
            iconBg="bg-success-100 text-success-600"
            loading={loadingDashboard}
          />
          <StatCard
            title="Total Products"
            value={stats.inventory?.totalProducts || 0}
            icon={Package}
            iconBg="bg-primary-100 text-primary-600"
            loading={loadingDashboard}
          />
          <StatCard
            title="Total Customers"
            value={stats.customers?.total || 0}
            icon={Users}
            iconBg="bg-warning-100 text-warning-600"
            loading={loadingDashboard}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.inventory?.lowStockProducts || 0}
            icon={AlertTriangle}
            iconBg="bg-danger-100 text-danger-600"
            loading={loadingDashboard}
          />
        </div>

        {/* Charts & Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SalesChart data={salesChartData} loading={loadingSales} />
          </div>

          {/* Low Stock Alert */}
          <div>
            <LowStockAlert
              products={lowStockProducts}
              loading={loadingLowStock}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={transactions}
          loading={loadingTransactions}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
