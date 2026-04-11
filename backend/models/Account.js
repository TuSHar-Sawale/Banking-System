import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      unique: true,
      required: [true, "Account number is required"],
      default: () => "ACC" + Date.now() + Math.random().toString(36).substr(2, 9),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    accountType: {
      type: String,
      enum: ["savings", "current", "student"],
      default: "savings",
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },
    overdraftLimit: {
      type: Number,
      default: 0, // For current accounts
    },
    monthlyTransactionLimit: {
      type: Number,
      default: 50, // Savings account limit
    },
    transactionsThisMonth: {
      type: Number,
      default: 0,
    },
    interest: {
      type: Number,
      default: 3.5, // 3.5% per annum for savings
    },
    lastInterestApplied: {
      type: Date,
      default: null,
    },
    freezeReason: {
      type: String,
      default: null,
    },
    frozenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    freezeDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to deposit money
accountSchema.methods.deposit = function (amount) {
  if (amount <= 0) {
    throw new Error("Deposit amount must be positive");
  }
  this.balance += amount;
  return this.balance;
};

// Method to withdraw money
accountSchema.methods.withdraw = function (amount) {
  if (amount <= 0) {
    throw new Error("Withdrawal amount must be positive");
  }
  const availableBalance = this.balance + this.overdraftLimit;
  if (amount > availableBalance) {
    throw new Error("Insufficient balance");
  }
  this.balance -= amount;
  return this.balance;
};

// Method to check if transaction limit exceeded
accountSchema.methods.canTransact = function () {
  return (
    this.transactionsThisMonth < this.monthlyTransactionLimit ||
    this.accountType === "current"
  );
};

// Method to freeze account
accountSchema.methods.freeze = function (adminId, reason = "Suspicious activity") {
  this.status = "frozen";
  this.freezeReason = reason;
  this.frozenBy = adminId;
  this.freezeDate = new Date();
  return this;
};

// Method to unfreeze account
accountSchema.methods.unfreeze = function () {
  this.status = "active";
  this.freezeReason = null;
  this.frozenBy = null;
  this.freezeDate = null;
  return this;
};

// Reset monthly transaction count (call monthly)
accountSchema.methods.resetMonthlyTransactions = function () {
  this.transactionsThisMonth = 0;
  return this;
};

// Indexes for faster queries
accountSchema.index({ userId: 1 });
accountSchema.index({ accountNumber: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ createdAt: -1 });

const Account = mongoose.model("Account", accountSchema);
export default Account;
