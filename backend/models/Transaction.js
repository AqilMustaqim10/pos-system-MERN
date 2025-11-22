import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: String, // Store name in case product is deleted
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Payment
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "ewallet", "bank_transfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "refunded"],
      default: "paid",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    changeGiven: {
      type: Number,
      default: 0,
    },
    // Staff who processed
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Transaction status
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate transaction number before save
transactionSchema.pre("save", async function (next) {
  if (!this.transactionNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Find last transaction of the day
    const lastTransaction = await this.constructor
      .findOne({ transactionNumber: new RegExp(`^TRX-${year}${month}${day}`) })
      .sort({ transactionNumber: -1 });

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(
        lastTransaction.transactionNumber.slice(-4)
      );
      sequence = lastSequence + 1;
    }

    this.transactionNumber = `TRX-${year}${month}${day}-${String(
      sequence
    ).padStart(4, "0")}`;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
