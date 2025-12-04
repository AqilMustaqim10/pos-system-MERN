import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Award } from "lucide-react";
import toast from "react-hot-toast";
import customerService from "../../services/customerService";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import CustomerForm from "../../components/customers/CustomerForm";
import Card from "../../components/ui/Card";

const Customers = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch customers
  const { data, isLoading } = useQuery({
    queryKey: ["customers", searchQuery],
    queryFn: () => customerService.getAll({ search: searchQuery }),
  });

  const customers = data?.data || [];

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      toast.success("Customer created successfully!");
      queryClient.invalidateQueries(["customers"]);
      setShowModal(false);
      setSelectedCustomer(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create customer");
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: () => {
      toast.success("Customer updated successfully!");
      queryClient.invalidateQueries(["customers"]);
      setShowModal(false);
      setSelectedCustomer(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update customer");
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      toast.success("Customer deleted successfully!");
      queryClient.invalidateQueries(["customers"]);
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    },
  });

  const handleAdd = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    setDeleteConfirm(customer);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm._id);
    }
  };

  const handleSubmit = (formData) => {
    if (selectedCustomer) {
      updateMutation.mutate({ id: selectedCustomer._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email || "No email"}</p>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row) => <span className="text-gray-900">{row.phone}</span>,
    },
    {
      header: "Purchases",
      accessor: "totalPurchases",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.totalPurchases || 0}</p>
          <p className="text-xs text-gray-500">
            RM {(row.totalSpent || 0).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      header: "Loyalty Points",
      accessor: "loyaltyPoints",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-warning-500" />
          <span className="font-medium text-warning-600">
            {row.loyaltyPoints || 0}
          </span>
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
            className="text-red-600 hover:text-red-800"
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
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Card>

        {/* Table */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={customers}
            loading={isLoading}
            emptyMessage="No customers found. Add your first customer!"
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? "Edit Customer" : "Add New Customer"}
        size="lg"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleSubmit}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Customer"
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
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Customers;
