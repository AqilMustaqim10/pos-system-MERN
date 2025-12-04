import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Receipt,
  Eye,
  CreditCard,
  Banknote,
  Wallet,
  Building,
} from "lucide-react";
import transactionService from "../../services/transactionService";
import Layout from "../../components/layout/Layout";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Card from "../../components/ui/Card";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", paymentFilter],
    queryFn: () =>
      transactionService.getAll({
        paymentMethod: paymentFilter || undefined,
      }),
  });

  const transactions = data?.data || [];

  // Filter transactions by search
  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.transactionNumber.toLowerCase().includes(searchLower) ||
      transaction.customer?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "ewallet":
        return <Wallet className="w-4 h-4" />;
      case "bank_transfer":
        return <Building className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const columns = [
    {
      header: "Transaction #",
      accessor: "transactionNumber",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          {row.transactionNumber}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(row.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "customer",
      render: (row) => (
        <span className="text-sm text-gray-900">
          {row.customer?.name || "Walk-in"}
        </span>
      ),
    },
    {
      header: "Items",
      accessor: "items",
      render: (row) => (
        <span className="text-sm text-gray-900">
          {row.items.length} item{row.items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      header: "Payment",
      accessor: "paymentMethod",
      render: (row) => (
        <div className="flex items-center space-x-2">
          {getPaymentIcon(row.paymentMethod)}
          <span className="text-sm text-gray-900 capitalize">
            {row.paymentMethod.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      header: "Total",
      accessor: "totalAmount",
      render: (row) => (
        <span className="text-sm font-semibold text-gray-900">
          RM {row.totalAmount.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.status === "completed"
              ? "bg-success-100 text-success-700"
              : row.status === "cancelled"
              ? "bg-gray-100 text-gray-700"
              : "bg-danger-100 text-danger-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-primary-600 hover:text-primary-800"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const paymentOptions = [
    { value: "", label: "All Payment Methods" },
    { value: "cash", label: "Cash" },
    { value: "card", label: "Card" },
    { value: "ewallet", label: "E-Wallet" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction History
          </h1>
          <p className="text-gray-600 mt-1">View all sales transactions</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by transaction # or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={paymentOptions}
            />
          </div>
        </Card>

        {/* Table */}
        <Card padding={false}>
          <Table
            columns={columns}
            data={filteredTransactions}
            loading={isLoading}
            emptyMessage="No transactions found."
          />
        </Card>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Transaction Number</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {selectedTransaction.transactionNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTransaction.customer?.name || "Walk-in Customer"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cashier</p>
                  <p className="font-semibold text-gray-900">
                    {selectedTransaction.cashier?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {selectedTransaction.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        RM {item.unitPrice.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      RM {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  RM {selectedTransaction.subtotal.toFixed(2)}
                </span>
              </div>

              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-success-600">
                    - RM {selectedTransaction.discount.toFixed(2)}
                  </span>
                </div>
              )}

              {selectedTransaction.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">
                    RM {selectedTransaction.tax.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-primary-600">
                  RM {selectedTransaction.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Payment Method</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getPaymentIcon(selectedTransaction.paymentMethod)}
                    <span className="font-semibold text-gray-900 capitalize">
                      {selectedTransaction.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {selectedTransaction.paymentMethod === "cash" && (
                  <>
                    <div>
                      <p className="text-xs text-gray-600">Amount Paid</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        RM {selectedTransaction.amountPaid.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Change Given</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        RM {selectedTransaction.changeGiven.toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Transactions;
