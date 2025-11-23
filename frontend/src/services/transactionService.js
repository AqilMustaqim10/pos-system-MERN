import api from "./api";

const transactionService = {
  // Get all transactions
  getAll: async (params = {}) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  // Get single transaction
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  create: async (data) => {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  // Get daily sales
  getDailySales: async () => {
    const response = await api.get("/transactions/reports/daily");
    return response.data;
  },

  // Cancel transaction
  cancel: async (id) => {
    const response = await api.put(`/transactions/${id}/cancel`);
    return response.data;
  },
};

export default transactionService;
