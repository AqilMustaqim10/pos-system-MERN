import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import usePOSStore from "../../store/posStore";
import Button from "../ui/Button";

const Cart = ({ onCheckout }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    discount,
    tax,
    getSubtotal,
    getTotalAmount,
  } = usePOSStore();

  const subtotal = getSubtotal();
  const total = getTotalAmount();

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <ShoppingCart className="w-16 h-16 mb-3" />
        <p className="text-sm">Cart is empty</p>
        <p className="text-xs">Add products to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 mb-4">
        {cartItems.map((item) => (
          <div key={item._id} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500">{item.sku}</p>
              </div>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-danger-500 hover:text-danger-700 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock}
                  className="w-7 h-7 flex items-center justify-center rounded bg-primary-100 hover:bg-primary-200 text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  RM {item.price.toFixed(2)} each
                </p>
                <p className="font-semibold text-gray-900">
                  RM {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">RM {subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-success-600">
              - RM {discount.toFixed(2)}
            </span>
          </div>
        )}

        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">RM {tax.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-xl text-primary-600">
            RM {total.toFixed(2)}
          </span>
        </div>

        <Button onClick={onCheckout} fullWidth size="lg" className="mt-4">
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
