import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import productService from "../../services/productService";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import ProductForm from "../../components/products/ProductForm";
import Card from "../../components/ui/Card";

const Products = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => productService.getAll({ search: searchQuery }),
  });

  const products = data?.data || [];

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries(["products"]);
      setShowModal(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["products"]);
      setShowModal(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      queryClient.invalidateQueries(["products"]);
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleDelete = (product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm._id);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      header: "SKU",
      accessor: "sku",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {row.sku}
        </span>
      ),
    },
    {
      header: "Product",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.category?.name}</p>
        </div>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (row) => (
        <span className="text-gray-900 font-medium">
          RM {row.price.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Stock",
      accessor: "stock",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span
            className={`font-medium ${
              row.stock <= row.lowStockThreshold
                ? "text-danger-600"
                : "text-gray-900"
            }`}
          >
            {row.stock}
          </span>
          {row.stock <= row.lowStockThreshold && (
            <AlertTriangle className="w-4 h-4 text-danger-500" />
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.isActive
              ? "bg-success-100 text-success-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-primary-600 hover:text-primary-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="text-danger-600 hover:text-danger-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
        {/* Search */}
        <Card className="mb-6">
          <Input
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {/* Table */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={products}
            loading={isLoading}
            emptyMessage="No products found. Add your first product!"
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.name}</strong>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Products;
