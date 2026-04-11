import express from "express";
import {
  createAccount,
  getAllAccounts,
  getAccount,
  updateProfile,
  freezeAccount,
  unfreezeAccount,
  deactivateAccount,
  getAccountSummary,
  searchAccountByNumber,
} from "../contollers/accountController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All account routes require authentication
router.use(authMiddleware);

// Create new account
router.post("/create-account", createAccount);

// Get all accounts for user
router.get("/accounts/:userId", getAllAccounts);

// Get specific account details
router.get("/account/:accountId", getAccount);

// Get account summary (for dashboard)
router.get("/summary/:userId", getAccountSummary);

// Search account by account number
router.get("/search/:accountNumber", searchAccountByNumber);

// Update user profile
router.put("/update-profile/:userId", updateProfile);

// Freeze account (admin only)
router.post("/freeze/:accountId", adminOnly, freezeAccount);

// Unfreeze account (admin only)
router.post("/unfreeze/:accountId", adminOnly, unfreezeAccount);

// Deactivate account
router.delete("/deactivate/:accountId", deactivateAccount);

export default router;
