import api from "./api";

const analyticsService = {
  // Get dashboard overview
  getDashboard: async () => {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },

  // Get sales report
  getSalesReport: async (params = {}) => {
    const response = await api.get("/analytics/sales", { params });
    return response.data;
  },

  // Get top products
  getTopProducts: async (limit = 5) => {
    const response = await api.get("/analytics/top-products", {
      params: { limit },
    });
    return response.data;
  },

  // Get revenue by category
  getRevenueByCategory: async () => {
    const response = await api.get("/analytics/revenue-by-category");
    return response.data;
  },
};

export default analyticsService;
