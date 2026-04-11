import Loan from "../models/Loan.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

// @desc    Apply for a loan
// @route   POST /api/loans/apply
// @access  Private
export const applyForLoan = async (req, res) => {
  try {
    const { principal, interestRate, term } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!principal || !interestRate || !term) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (principal < 1000) {
      return res.status(400).json({ message: "Loan amount must be at least ₹1000" });
    }

    if (principal > 5000000) {
      return res.status(400).json({ message: "Loan amount cannot exceed ₹50 lakhs" });
    }

    if (term < 6 || term > 240) {
      return res.status(400).json({ message: "Loan term must be between 6 to 240 months" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has pending/active loans
    const existingLoan = await Loan.findOne({
      userId,
      status: { $in: ["pending", "active"] },
    });

    if (existingLoan) {
      return res.status(400).json({
        message: "You have a pending or active loan. Complete it before applying for another.",
      });
    }

    // Create loan application
    const loan = new Loan({
      userId,
      principal: parseFloat(principal),
      interestRate: parseFloat(interestRate),
      term: parseInt(term),
    });

    await loan.save();

    res.status(201).json({
      message: "Loan application submitted successfully",
      loanId: loan.loanId,
      loan,
    });
  } catch (error) {
    console.error("Apply loan error:", error);
    res.status(500).json({ message: "Failed to apply for loan", error: error.message });
  }
};

// @desc    Get loan details
// @route   GET /api/loans/:loanId
// @access  Private
export const getLoanDetails = async (req, res) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const loan = await Loan.findById(loanId).populate("userId", "name email").populate("approvedBy", "name");

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Check authorization
    if (userRole !== "admin" && loan.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      loan,
    });
  } catch (error) {
    console.error("Get loan details error:", error);
    res.status(500).json({ message: "Failed to fetch loan details", error: error.message });
  }
};

// @desc    Get all loans for a user
// @route   GET /api/loans/user/:userId
// @access  Private
export const getUserLoans = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const userRole = req.user.role;

    // Check authorization
    if (userRole !== "admin" && userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const loans = await Loan.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      loans,
      count: loans.length,
    });
  } catch (error) {
    console.error("Get user loans error:", error);
    res.status(500).json({ message: "Failed to fetch loans", error: error.message });
  }
};

// @desc    Process loan payment
// @route   POST /api/loans/:loanId/payment
// @access  Private
export const processLoanPayment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { accountId, amount } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!accountId || !amount) {
      return res.status(400).json({ message: "Account ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than 0" });
    }

    // Get loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Check authorization
    if (loan.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check loan status
    if (loan.status !== "active") {
      return res.status(400).json({ message: "Loan is not active" });
    }

    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization for account
    if (account.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check balance
    if (account.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        availableBalance: account.balance,
      });
    }

    // Generate payment ID
    const paymentId = "PAY" + Date.now();

    // Process payment
    loan.processPayment(amount, paymentId, accountId);
    account.withdraw(amount);

    // Create transaction record
    const transaction = new Transaction({
      senderId: userId,
      senderAccount: accountId,
      amount,
      type: "loan_payment",
      description: `Loan payment for ${loan.loanId}`,
      status: "completed",
    });

    await Promise.all([loan.save(), account.save(), transaction.save()]);

    // If loan is closed, notify user
    if (loan.status === "closed") {
      const user = await User.findById(userId);
      if (user && user.isEmailVerified) {
        // Send loan closure email (implement in sendEmail.js)
      }
    }

    res.status(201).json({
      message: "Loan payment processed successfully",
      paymentId,
      loan: {
        loanId: loan.loanId,
        status: loan.status,
        paidAmount: loan.paidAmount,
        remainingAmount: loan.remainingAmount,
        nextPaymentDate: loan.nextPaymentDate,
      },
      accountBalance: account.balance,
    });
  } catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
};

// @desc    Activate approved loan (Admin function, can be called by user after approval)
// @route   POST /api/loans/:loanId/activate
// @access  Private/Admin
export const activateLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "approved") {
      return res.status(400).json({ message: "Loan is not approved" });
    }

    // Activate loan
    loan.activateLoan();

    // Disburse loan amount to user's account
    const account = await Account.findOne({ userId: loan.userId, status: "active" });
    if (account) {
      // Create disbursement transaction (as deposit)
      const transaction = new Transaction({
        senderId: loan.userId,
        senderAccount: account._id,
        receiverId: null,
        receiverAccount: null,
        amount: loan.principal,
        type: "deposit", // Show as deposit in transaction history
        description: `Loan Disbursement - ${loan.loanId}`,
        status: "completed",
      });

      account.deposit(loan.principal);
      await Promise.all([loan.save(), account.save(), transaction.save()]);

      return res.status(200).json({
        message: "Loan activated and amount disbursed successfully",
        loan,
      });
    } else {
      return res.status(400).json({ message: "User account not found" });
    }
  } catch (error) {
    console.error("Activate loan error:", error);
    res.status(500).json({ message: "Failed to activate loan", error: error.message });
  }
};

// @desc    Get loan payment schedule
// @route   GET /api/loans/:loanId/schedule
// @access  Private
export const getLoanPaymentSchedule = async (req, res) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Check authorization
    if (userRole !== "admin" && loan.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Generate payment schedule
    const schedule = [];
    let currentDate = loan.disbursementDate || new Date();
    let remainingBalance = loan.totalAmount;

    for (let i = 1; i <= loan.term; i++) {
      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + 1);

      const isPaid = loan.paymentHistory.length >= i;
      const payment = isPaid ? loan.paymentHistory[i - 1] : null;

      schedule.push({
        installmentNo: i,
        dueDate: currentDate,
        amount: loan.emi,
        paid: isPaid,
        paidDate: payment?.date || null,
        paidAmount: payment?.amount || null,
        status: isPaid ? "completed" : "pending",
      });

      if (!isPaid) {
        remainingBalance -= loan.emi;
      }
    }

    res.status(200).json({
      loanId: loan.loanId,
      totalAmount: loan.totalAmount,
      emi: loan.emi,
      term: loan.term,
      paidAmount: loan.paidAmount,
      remainingAmount: loan.remainingAmount,
      schedule,
    });
  } catch (error) {
    console.error("Get payment schedule error:", error);
    res.status(500).json({ message: "Failed to fetch payment schedule", error: error.message });
  }
};
