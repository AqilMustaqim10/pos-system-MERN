import { useState } from "react";
import { X, CreditCard, Wallet, Banknote, Building } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import usePOSStore from "../../store/posStore";

const PaymentModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const { getTotalAmount, discount, setDiscount } = usePOSStore();
  const totalAmount = getTotalAmount();

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [discountInput, setDiscountInput] = useState(discount);

  if (!isOpen) return null;

  const handleDiscountChange = (value) => {
    const discount = parseFloat(value) || 0;
    setDiscountInput(discount);
    setDiscount(discount);
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, paid - totalAmount);
  };

  const handleSubmit = () => {
    if (paymentMethod === "cash") {
      const paid = parseFloat(amountPaid) || 0;
      if (paid < totalAmount) {
        alert("Amount paid is less than total!");
        return;
      }
    }

    onSubmit({
      paymentMethod,
      amountPaid: parseFloat(amountPaid) || totalAmount,
      discount: discountInput,
    });
  };

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "card", label: "Card", icon: CreditCard },
    { id: "ewallet", label: "E-Wallet", icon: Wallet },
    { id: "bank_transfer", label: "Transfer", icon: Building },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Discount */}
          <div>
            <Input
              label="Discount (RM)"
              type="number"
              value={discountInput}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          {/* Total */}
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-primary-600">
                RM {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 mx-auto mb-2 ${
                      paymentMethod === id
                        ? "text-primary-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      paymentMethod === id
                        ? "text-primary-600"
                        : "text-gray-600"
                    }`}
                  >
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid (for cash) */}
          {paymentMethod === "cash" && (
            <>
              <Input
                label="Amount Paid (RM)"
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={totalAmount.toFixed(2)}
                min="0"
                step="0.01"
                required
              />

              {amountPaid && parseFloat(amountPaid) >= totalAmount && (
                <div className="bg-success-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-success-700 font-medium">Change</span>
                    <span className="text-xl font-bold text-success-600">
                      RM {calculateChange().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Amount Buttons (for cash) */}
          {paymentMethod === "cash" && (
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAmountPaid(amount.toString())}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  RM {amount}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" loading={loading}>
            Complete Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
