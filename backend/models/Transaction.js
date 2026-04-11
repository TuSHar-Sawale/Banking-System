import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      default: () => "TXN" + Date.now() + Math.random().toString(36).substr(2, 9),
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for deposit/withdraw
    },
    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer", "loan_payment", "loan_disbursement"],
      required: [true, "Transaction type is required"],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    failureReason: {
      type: String,
      default: null,
    },
    fees: {
      type: Number,
      default: 0,
    },
    metadata: {
      fraudScore: {
        type: Number,
        default: 0, // 0-100 risk score
      },
      flagged: {
        type: Boolean,
        default: false,
      },
      flagReason: {
        type: String,
        default: null,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: false }
);

// Virtual for formatted amount
transactionSchema.virtual("formattedAmount").get(function () {
  return `₹${this.amount.toFixed(2)}`;
});

// Method to mark transaction as completed
transactionSchema.methods.complete = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this;
};

// Method to mark transaction as failed
transactionSchema.methods.fail = function (reason = "Unknown error") {
  this.status = "failed";
  this.failureReason = reason;
  return this;
};

// Method to flag transaction for fraud
transactionSchema.methods.flagForFraud = function (score, reason) {
  this.metadata.fraudScore = score;
  this.metadata.flagged = true;
  this.metadata.flagReason = reason;
  return this;
};

// Indexes for faster queries
transactionSchema.index({ senderId: 1, timestamp: -1 });
transactionSchema.index({ receiverId: 1, timestamp: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ timestamp: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ "metadata.flagged": 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
