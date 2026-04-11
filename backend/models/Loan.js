import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      unique: true,
      required: true,
      default: () => "LOAN" + Date.now() + Math.random().toString(36).substr(2, 9),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    principal: {
      type: Number,
      required: [true, "Principal amount is required"],
      min: [1000, "Loan amount must be at least ₹1000"],
      max: [5000000, "Loan amount cannot exceed ₹50 lakhs"],
    },
    interestRate: {
      type: Number,
      required: [true, "Interest rate is required"],
      min: [5, "Interest rate cannot be less than 5%"],
      max: [20, "Interest rate cannot exceed 20%"],
    },
    term: {
      type: Number,
      required: [true, "Loan term (months) is required"],
      min: [6, "Minimum loan term is 6 months"],
      max: [240, "Maximum loan term is 20 years"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "closed"],
      default: "pending",
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    disbursementDate: {
      type: Date,
      default: null,
    },
    emi: {
      type: Number,
      default: null, // Calculated as EMI
    },
    totalAmount: {
      type: Number,
      default: null, // Principal + Interest
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    remainingAmount: {
      type: Number,
      default: null,
    },
    nextPaymentDate: {
      type: Date,
      default: null,
    },
    paymentHistory: [
      {
        paymentId: String,
        amount: Number,
        date: Date,
        accountId: mongoose.Schema.Types.ObjectId,
      },
    ],
    missedPayments: {
      type: Number,
      default: 0,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calculate EMI using formula: EMI = P * [r(1+r)^n] / [(1+r)^n - 1]
loanSchema.methods.calculateEMI = function () {
  const P = this.principal;
  const r = this.interestRate / 100 / 12; // Monthly interest rate
  const n = this.term; // Number of months

  if (r === 0) {
    this.emi = P / n;
  } else {
    const numerator = P * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    this.emi = numerator / denominator;
  }

  this.totalAmount = this.emi * n;
  this.remainingAmount = this.totalAmount;
  return this.emi;
};

// Method to process loan payment
loanSchema.methods.processPayment = function (amount, paymentId, accountId) {
  if (this.status !== "active") {
    throw new Error("Loan is not active");
  }

  if (amount < this.emi) {
    throw new Error(`Payment must be at least ₹${this.emi.toFixed(2)}`);
  }

  this.paidAmount += amount;
  this.remainingAmount = this.totalAmount - this.paidAmount;

  this.paymentHistory.push({
    paymentId,
    amount,
    date: new Date(),
    accountId,
  });

  // Set next payment date (30 days from now)
  this.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Close loan if fully paid
  if (this.remainingAmount <= 0) {
    this.status = "closed";
  }

  return this;
};

// Method to approve loan
loanSchema.methods.approveLoan = function (adminId) {
  this.status = "approved";
  this.approvalDate = new Date();
  this.approvedBy = adminId;
  this.disbursementDate = new Date();
  this.calculateEMI();
  this.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return this;
};

// Method to reject loan
loanSchema.methods.rejectLoan = function (reason) {
  this.status = "rejected";
  this.rejectionReason = reason;
  return this;
};

// Method to activate loan
loanSchema.methods.activateLoan = function () {
  if (this.status !== "approved") {
    throw new Error("Only approved loans can be activated");
  }
  this.status = "active";
  return this;
};

// Check if payment is due
loanSchema.methods.isPaymentDue = function () {
  if (this.status !== "active" || !this.nextPaymentDate) {
    return false;
  }
  return new Date() >= this.nextPaymentDate;
};

// Indexes
loanSchema.index({ userId: 1});
loanSchema.index({ status: 1 });
loanSchema.index({ nextPaymentDate: 1 });
loanSchema.index({ createdAt: -1 });

const Loan = mongoose.model("Loan", loanSchema);
export default Loan;
