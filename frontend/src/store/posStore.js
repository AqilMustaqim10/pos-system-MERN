import { create } from "zustand";

const usePOSStore = create((set, get) => ({
  // Cart items
  cartItems: [],

  // Selected customer
  selectedCustomer: null,

  // Payment details
  discount: 0,
  tax: 0,

  // Add item to cart
  addToCart: (product) => {
    const { cartItems } = get();
    const existingItem = cartItems.find((item) => item._id === product._id);

    if (existingItem) {
      // Increase quantity if already in cart
      set({
        cartItems: cartItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      // Add new item
      set({
        cartItems: [...cartItems, { ...product, quantity: 1 }],
      });
    }
  },

  // Remove item from cart
  removeFromCart: (productId) => {
    set({
      cartItems: get().cartItems.filter((item) => item._id !== productId),
    });
  },

  // Update item quantity
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }

    set({
      cartItems: get().cartItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      ),
    });
  },

  // Set customer
  setCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },

  // Set discount
  setDiscount: (discount) => {
    set({ discount: Math.max(0, discount) });
  },

  // Set tax
  setTax: (tax) => {
    set({ tax: Math.max(0, tax) });
  },

  // Calculate totals
  getSubtotal: () => {
    const { cartItems } = get();
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  getTotalAmount: () => {
    const { discount, tax } = get();
    const subtotal = get().getSubtotal();
    return subtotal - discount + tax;
  },

  // Clear cart
  clearCart: () => {
    set({
      cartItems: [],
      selectedCustomer: null,
      discount: 0,
      tax: 0,
    });
  },
}));

export default usePOSStore;
