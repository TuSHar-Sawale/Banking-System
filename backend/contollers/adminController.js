import User from "../models/User.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import Loan from "../models/Loan.js";

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

// @desc    Get user details with accounts and transactions
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's accounts
    const accounts = await Account.find({ userId });

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ timestamp: -1 })
      .limit(20);

    // Calculate user stats
    const lastLogin = user.lastLogin;
    const totalTransactions = await Transaction.countDocuments({
      $or: [{ senderId: userId }, { receiverId: userId }],
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    res.status(200).json({
      user,
      accounts,
      transactions,
      stats: {
        accountCount: accounts.length,
        transactionCount: totalTransactions,
        totalBalance,
        lastLogin,
      },
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Failed to fetch user details", error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const disabledUsers = await User.countDocuments({ status: "disabled" });
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Account statistics
    const totalAccounts = await Account.countDocuments();
    const activeAccounts = await Account.countDocuments({ status: "active" });
    const frozenAccounts = await Account.countDocuments({ status: "frozen" });

    // Get total balance across all accounts
    const balanceData = await Account.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          averageBalance: { $avg: "$balance" },
        },
      },
    ]);

    const totalBalance = balanceData[0]?.totalBalance || 0;
    const averageBalance = balanceData[0]?.averageBalance || 0;

    // Transaction statistics
    const totalTransactions = await Transaction.countDocuments();
    const todayTransactions = await Transaction.countDocuments({
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // Get transaction volume
    const transactionVolume = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);

    const totalTransactionVolume = transactionVolume[0]?.totalAmount || 0;
    const averageTransaction = transactionVolume[0]?.averageAmount || 0;

    // Suspicious transactions
    const suspiciousTransactions = await Transaction.countDocuments({
      "metadata.flagged": true,
    });

    // Loan statistics
    const totalLoans = await Loan.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: "active" });
    const approvedLoans = await Loan.countDocuments({ status: "approved" });
    const pendingLoans = await Loan.countDocuments({ status: "pending" });

    res.status(200).json({
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          disabled: disabledUsers,
          lastMonth: lastMonthUsers,
        },
        accounts: {
          total: totalAccounts,
          active: activeAccounts,
          frozen: frozenAccounts,
          totalBalance,
          averageBalance,
        },
        transactions: {
          total: totalTransactions,
          today: todayTransactions,
          totalVolume: totalTransactionVolume,
          averageAmount: averageTransaction,
          suspicious: suspiciousTransactions,
        },
        loans: {
          total: totalLoans,
          active: activeLoans,
          approved: approvedLoans,
          pending: pendingLoans,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch statistics", error: error.message });
  }
};

// @desc    Get suspicious transactions
// @route   GET /api/admin/transactions/suspicious
// @access  Private/Admin
export const getSuspiciousTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, minScore = 50 } = req.query;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find({
      "metadata.flagged": true,
      "metadata.fraudScore": { $gte: parseInt(minScore) },
    })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Transaction.countDocuments({
      "metadata.flagged": true,
      "metadata.fraudScore": { $gte: parseInt(minScore) },
    });

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
    console.error("Get suspicious transactions error:", error);
    res.status(500).json({ message: "Failed to fetch suspicious transactions", error: error.message });
  }
};

// @desc    Get all accounts that need review (frozen or suspicious)
// @route   GET /api/admin/accounts-review
// @access  Private/Admin
export const getAccountsForReview = async (req, res) => {
  try {
    const frozenAccounts = await Account.find({ status: "frozen" })
      .populate("userId", "name email phone")
      .sort({ freezeDate: -1 });

    const accountsWithSuspiciousActivity = await Account.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "senderAccount",
          as: "transactions",
        },
      },
      {
        $match: {
          "transactions.metadata.flagged": true,
        },
      },
    ]);

    res.status(200).json({
      frozenAccounts,
      accountsWithSuspiciousActivity: accountsWithSuspiciousActivity.length,
    });
  } catch (error) {
    console.error("Get accounts for review error:", error);
    res.status(500).json({ message: "Failed to fetch accounts", error: error.message });
  }
};

// @desc    Disable/enable user account
// @route   PUT /api/admin/users/:userId/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!["active", "disabled", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User status updated to ${status}`,
      user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

// @desc    Get all pending loans
// @route   GET /api/admin/loans/pending
// @access  Private/Admin
export const getPendingLoans = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const loans = await Loan.find({ status: "pending" })
      .populate("userId", "name email phone")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: 1 });

    const totalCount = await Loan.countDocuments({ status: "pending" });

    res.status(200).json({
      loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get pending loans error:", error);
    res.status(500).json({ message: "Failed to fetch loans", error: error.message });
  }
};

// @desc    Approve or reject loan application
// @route   PUT /api/admin/loans/:loanId
// @access  Private/Admin
export const approveLoanApplication = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.userId;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({ message: "Loan is not pending" });
    }

    if (action === "approve") {
      loan.approveLoan(adminId);
      await loan.save();

      // Create corresponding account or add to existing
      const userAccounts = await Account.find({ userId: loan.userId });
      // Account is already created when user registers

      return res.status(200).json({
        message: "Loan approved successfully",
        loan,
      });
    } else {
      loan.rejectLoan(reason || "Application rejected by admin");
      await loan.save();

      return res.status(200).json({
        message: "Loan rejected successfully",
        loan,
      });
    }
  } catch (error) {
    console.error("Approve loan error:", error);
    res.status(500).json({ message: "Failed to process loan", error: error.message });
  }
};

// @desc    Get activity logs (recent actions)
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    // Get recent transactions as activity
    const recentActivity = await Transaction.find()
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Transaction.countDocuments();

    res.status(200).json({
      activities: recentActivity,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({ message: "Failed to fetch activity logs", error: error.message });
  }
};
