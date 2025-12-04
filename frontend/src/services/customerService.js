import api from "./api";

const customerService = {
  // Get all customers
  getAll: async (params = {}) => {
    const response = await api.get("/customers", { params });
    return response.data;
  },

  // Get single customer
  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create customer
  create: async (data) => {
    const response = await api.post("/customers", data);
    return response.data;
  },

  // Update customer
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  // Delete customer
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;
