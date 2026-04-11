import express from "express";
import {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory,
  getTransaction,
} from "../contollers/transactionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All transaction routes require authentication
router.use(authMiddleware);

// Deposit money
router.post("/deposit", deposit);

// Withdraw money
router.post("/withdraw", withdraw);

// Transfer money
router.post("/transfer", transfer);

// Get transaction history
router.get("/history/:userId", getTransactionHistory);

// Get specific transaction
router.get("/:transactionId", getTransaction);

export default router;
