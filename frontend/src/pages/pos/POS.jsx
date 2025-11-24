import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ProductSearch from "../../components/pos/productSearch";
import Cart from "../../components/pos/Cart";
import PaymentModal from "../../components/pos/PaymentModal";
import Button from "../../components/ui/Button";
import transactionService from "../../services/transactionService";
import usePOSStore from "../../store/posStore";

const POS = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartItems, selectedCustomer, clearCart } = usePOSStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: (data) => {
      toast.success("Transaction completed successfully!");
      clearCart();
      setShowPaymentModal(false);

      // Refresh data
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboard"]);
      queryClient.invalidateQueries(["recent-transactions"]);

      // Show transaction number
      toast.success(`Transaction #${data.data.transactionNumber}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Transaction failed";
      toast.error(message);
    },
  });

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = (paymentData) => {
    const transactionData = {
      items: cartItems.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      customer: selectedCustomer?._id,
      discount: paymentData.discount,
      tax: 0,
      paymentMethod: paymentData.paymentMethod,
      amountPaid: paymentData.amountPaid,
    };

    createTransactionMutation.mutate(transactionData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Point of Sale
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Items in cart</p>
                <p className="text-lg font-bold text-primary-600">
                  {cartItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Products Section - 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Products
            </h2>
            <ProductSearch />
          </div>

          {/* Cart Section - 1 column */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Cart ({cartItems.length})
            </h2>
            <Cart onCheckout={handleCheckout} />
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePayment}
        loading={createTransactionMutation.isPending}
      />
    </div>
  );
};

export default POS;
