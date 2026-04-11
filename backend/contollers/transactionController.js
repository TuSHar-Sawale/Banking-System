import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import User from "../models/User.js";
import { sendTransactionEmail } from "../utils/sendEmail.js";

// Function to detect fraud
const detectFraud = async (senderId, amount) => {
  let fraudScore = 0;
  let flagReason = null;

  // Get user's transaction history
  const recentTransactions = await Transaction.find({
    senderId,
    status: "completed",
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
  });

  if (recentTransactions.length > 0) {
    // Calculate average transaction amount
    const avgAmount =
      recentTransactions.reduce((sum, t) => sum + t.amount, 0) /
      recentTransactions.length;

    // Flag if amount is 5x greater than average
    if (amount > avgAmount * 5) {
      fraudScore += 40;
      flagReason = `Transaction amount (₹${amount}) is 5x greater than user's average (₹${avgAmount.toFixed(2)})`;
    }

    // Flag if multiple transactions in short time (more than 5 in last hour)
    const recentHourTransactions = await Transaction.countDocuments({
      senderId,
      status: "completed",
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentHourTransactions > 5) {
      fraudScore += 30;
      flagReason = `Multiple transactions detected (${recentHourTransactions} in last hour)`;
    }
  }

  return { fraudScore, flagged: fraudScore > 50, flagReason };
};

// @desc    Deposit money
// @route   POST /api/transactions/deposit
// @access  Private
export const deposit = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!accountId || !amount) {
      return res.status(400).json({ message: "Account ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization
    if (account.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check account status
    if (account.status !== "active") {
      return res.status(400).json({ message: "Account is not active" });
    }

    // Create transaction record
    const transaction = new Transaction({
      senderId: userId,
      senderAccount: accountId,
      amount,
      type: "deposit",
      description: description || "Deposit",
      status: "completed",
    });

    // Deposit money
    account.deposit(amount);
    await account.save();

    await transaction.save();

    // Send email notification
    const user = await User.findById(userId);
    if (user && user.isEmailVerified) {
      await sendTransactionEmail(user.email, {
        senderName: user.name,
        receiverName: "Self (Deposit)",
        amount,
        type: "deposit",
        timestamp: transaction.timestamp,
      });
    }

    res.status(201).json({
      message: "Deposit successful",
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        balance: account.balance,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: "Deposit failed", error: error.message });
  }
};

// @desc    Withdraw money
// @route   POST /api/transactions/withdraw
// @access  Private
export const withdraw = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!accountId || !amount) {
      return res.status(400).json({ message: "Account ID and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    // Get account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization
    if (account.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check account status
    if (account.status !== "active") {
      return res.status(400).json({ message: "Account is not active" });
    }

    // Check balance
    if (account.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        availableBalance: account.balance,
      });
    }

    // Create transaction
    const transaction = new Transaction({
      senderId: userId,
      senderAccount: accountId,
      amount,
      type: "withdraw",
      description: description || "Withdrawal",
      status: "completed",
    });

    // Withdraw money
    account.withdraw(amount);
    await account.save();
    await transaction.save();

    // Send email
    const user = await User.findById(userId);
    if (user && user.isEmailVerified) {
      await sendTransactionEmail(user.email, {
        senderName: user.name,
        receiverName: "Cash Withdrawal",
        amount,
        type: "withdraw",
        timestamp: transaction.timestamp,
      });
    }

    res.status(201).json({
      message: "Withdrawal successful",
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        balance: account.balance,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Withdrawal failed", error: error.message });
  }
};

// @desc    Transfer money between accounts
// @route   POST /api/transactions/transfer
// @access  Private
export const transfer = async (req, res) => {
  try {
    const { senderAccountId, receiverAccountId, amount, description } = req.body;
    const senderId = req.user.userId;

    // Validation
    if (!senderAccountId || !receiverAccountId || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (senderAccountId === receiverAccountId) {
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    // Get accounts
    const senderAccount = await Account.findById(senderAccountId);
    const receiverAccount = await Account.findById(receiverAccountId);

    if (!senderAccount || !receiverAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization
    if (senderAccount.userId.toString() !== senderId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check account status
    if (senderAccount.status !== "active") {
      return res.status(400).json({ message: "Sender account is not active" });
    }

    if (receiverAccount.status !== "active") {
      return res.status(400).json({ message: "Receiver account is not active" });
    }

    // Check balance
    if (senderAccount.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
        availableBalance: senderAccount.balance,
      });
    }

    // Check transaction limit
    if (!senderAccount.canTransact()) {
      return res.status(400).json({
        message: "Monthly transaction limit exceeded for this account",
      });
    }

    // Detect fraud
    const fraudCheck = await detectFraud(senderId, amount);

    // Create transaction record
    const transaction = new Transaction({
      senderId,
      senderAccount: senderAccountId,
      receiverId: receiverAccount.userId,
      receiverAccount: receiverAccountId,
      amount,
      type: "transfer",
      description: description || "Transfer",
      status: "completed",
      metadata: {
        fraudScore: fraudCheck.fraudScore,
        flagged: fraudCheck.flagged,
        flagReason: fraudCheck.flagReason,
        ipAddress: req.ip,
      },
    });

    // Perform transfer
    senderAccount.withdraw(amount);
    receiverAccount.deposit(amount);
    senderAccount.transactionsThisMonth += 1;

    await senderAccount.save();
    await receiverAccount.save();
    await transaction.save();

    // Send emails
    const [senderUser, receiverUser] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverAccount.userId),
    ]);

    if (senderUser && senderUser.isEmailVerified) {
      await sendTransactionEmail(senderUser.email, {
        senderName: senderUser.name,
        receiverName: receiverUser?.name || "Unknown",
        amount,
        type: "transfer",
        timestamp: transaction.timestamp,
      });
    }

    if (receiverUser && receiverUser.isEmailVerified) {
      await sendTransactionEmail(receiverUser.email, {
        senderName: senderUser?.name || "Unknown",
        receiverName: receiverUser.name,
        amount,
        type: "transfer",
        timestamp: transaction.timestamp,
      });
    }

    res.status(201).json({
      message: "Transfer successful",
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        senderBalance: senderAccount.balance,
        receiverBalance: receiverAccount.balance,
        timestamp: transaction.timestamp,
        flagged: fraudCheck.flagged,
      },
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Transfer failed", error: error.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/transactions/history/:userId
// @access  Private
export const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const requestingUserId = req.user.userId;

    // Check authorization
    if (userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Build filter
    const filter = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (type) {
      filter.type = type;
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Get transactions with pagination
    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(filter)
      .populate("senderId", "name")
      .populate("receiverId", "name")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Transaction.countDocuments(filter);

    res.status(200).json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: "Failed to fetch transaction history", error: error.message });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:transactionId
// @access  Private
export const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({ transactionId })
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check authorization
    if (
      transaction.senderId._id.toString() !== userId &&
      transaction.receiverId?._id.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ message: "Failed to fetch transaction", error: error.message });
  }
};
