import api from "./api";

const productService = {
  // Get all products
  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get single product
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get low stock products
  getLowStock: async () => {
    const response = await api.get("/products/alerts/low-stock");
    return response.data;
  },

  // Create product
  create: async (data) => {
    const response = await api.post("/products", data);
    return response.data;
  },

  // Update product
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
