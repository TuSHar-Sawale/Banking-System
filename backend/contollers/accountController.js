import Account from "../models/Account.js";
import User from "../models/User.js";

// @desc    Create a new bank account for user
// @route   POST /api/account/create-account
// @access  Private
export const createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;
    const userId = req.user.userId;

    if (!accountType) {
      return res.status(400).json({ message: "Account type is required" });
    }

    if (!["savings", "current", "student"].includes(accountType)) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new account
    const account = new Account({
      userId,
      accountType,
      balance: 0,
    });

    await account.save();

    res.status(201).json({
      message: "Account created successfully",
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        status: account.status,
      },
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ message: "Failed to create account", error: error.message });
  }
};

// @desc    Get all accounts for a user
// @route   GET /api/account/accounts/:userId
// @access  Private
export const getAllAccounts = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const userRole = req.user.role;

    // Check authorization - users can only view their own accounts
    if (userRole !== "admin" && userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const accounts = await Account.find({ userId }).select(
      "accountNumber accountType balance status createdAt"
    );

    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ message: "No accounts found" });
    }

    res.status(200).json({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({ message: "Failed to fetch accounts", error: error.message });
  }
};

// @desc    Get specific account details
// @route   GET /api/account/account/:accountId
// @access  Private
export const getAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const requestingUserId = req.user.userId;
    const userRole = req.user.role;

    const account = await Account.findById(accountId).populate("userId", "name email phone");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization
    if (userRole !== "admin" && account.userId._id.toString() !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      account,
    });
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({ message: "Failed to fetch account", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/account/update-profile/:userId
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const { name, phone, address, profilePicture } = req.body;

    // Check authorization
    if (userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: user.getPublicProfile(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

// @desc    Freeze account (Admin only)
// @route   POST /api/account/freeze/:accountId
// @access  Private/Admin
export const freezeAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.userId;

    if (!reason) {
      return res.status(400).json({ message: "Freeze reason is required" });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.freeze(adminId, reason);
    await account.save();

    res.status(200).json({
      message: "Account frozen successfully",
      account,
    });
  } catch (error) {
    console.error("Freeze account error:", error);
    res.status(500).json({ message: "Failed to freeze account", error: error.message });
  }
};

// @desc    Unfreeze account (Admin only)
// @route   POST /api/account/unfreeze/:accountId
// @access  Private/Admin
export const unfreezeAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.unfreeze();
    await account.save();

    res.status(200).json({
      message: "Account unfrozen successfully",
      account,
    });
  } catch (error) {
    console.error("Unfreeze account error:", error);
    res.status(500).json({ message: "Failed to unfreeze account", error: error.message });
  }
};

// @desc    Deactivate account
// @route   DELETE /api/account/deactivate/:accountId
// @access  Private
export const deactivateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const requestingUserId = req.user.userId;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check authorization
    if (account.userId.toString() !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check balance before closing
    if (account.balance > 0) {
      return res.status(400).json({
        message: "Cannot close account with remaining balance. Please withdraw all funds.",
      });
    }

    account.status = "closed";
    await account.save();

    res.status(200).json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({ message: "Failed to deactivate account", error: error.message });
  }
};

// @desc    Get account summary (for dashboard)
// @route   GET /api/account/summary/:userId
// @access  Private
export const getAccountSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;

    // Check authorization
    if (userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const accounts = await Account.find({ userId, status: "active" });

    let totalBalance = 0;
    accounts.forEach((acc) => {
      totalBalance += acc.balance;
    });

    res.status(200).json({
      userId,
      totalBalance,
      accountCount: accounts.length,
      accounts: accounts.map((acc) => ({
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance,
      })),
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ message: "Failed to fetch summary", error: error.message });
  }
};

// @desc    Search account by account number
// @route   GET /api/account/search/:accountNumber
// @access  Private
export const searchAccountByNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({ message: "Account number is required" });
    }

    const account = await Account.findOne({ accountNumber, status: "active" }).populate("userId", "name");

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(200).json({
      account: {
        _id: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        ownerName: account.userId.name,
      },
    });
  } catch (error) {
    console.error("Search account error:", error);
    res.status(500).json({ message: "Failed to search account", error: error.message });
  }
};
