import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LogOut,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import analyticsService from "../../services/analyticsService";
import transactionService from "../../services/transactionService";
import productService from "../../services/productService";
import Button from "../../components/ui/Button";
import StatCard from "../../components/dashboard/StatCard";
import SalesChart from "../../components/dashboard/SalesChart";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import LowStockAlert from "../../components/dashboard/LowStockAlert";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = dashboardData?.data || {};
  const salesChartData = salesData?.data || [];
  const transactions = transactionsData?.data || [];
  const lowStockProducts = lowStockData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">POS System</h1>
                <p className="text-xs text-gray-500">Inventory Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
};

export default Dashboard;
