import express from "express";
import {
  applyForLoan,
  getLoanDetails,
  getUserLoans,
  processLoanPayment,
  activateLoan,
  getLoanPaymentSchedule,
} from "../contollers/loanController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All loan routes require authentication
router.use(authMiddleware);

// Apply for loan
router.post("/apply", applyForLoan);

// Get loan details
router.get("/:loanId", getLoanDetails);

// Get loans for a user
router.get("/user/:userId", getUserLoans);

// Get payment schedule
router.get("/:loanId/schedule", getLoanPaymentSchedule);

// Process loan payment
router.post("/:loanId/payment", processLoanPayment);

// Activate loan
router.post("/:loanId/activate", activateLoan);

export default router;
