import express from "express";
import {
  getAllUsers,
  getUserDetails,
  getDashboardStats,
  getSuspiciousTransactions,
  getAccountsForReview,
  updateUserStatus,
  getPendingLoans,
  approveLoanApplication,
  getActivityLogs,
} from "../contollers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId/status", updateUserStatus);

// Dashboard & Statistics
router.get("/dashboard-stats", getDashboardStats);
router.get("/activity-logs", getActivityLogs);

// Transaction Monitoring
router.get("/transactions/suspicious", getSuspiciousTransactions);

// Account Review
router.get("/accounts-review", getAccountsForReview);

// Loan Management
router.get("/loans/pending", getPendingLoans);
router.put("/loans/:loanId", approveLoanApplication);

export default router;
