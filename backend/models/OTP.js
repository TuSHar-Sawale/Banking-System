import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      index: true,
    },
    otpCode: {
      type: String,
      required: [true, "OTP code is required"],
    },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset", "phone_verification"],
      default: "email_verification",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete after expiry
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Method to verify OTP
otpSchema.methods.verifyOTP = function (enteredOtp) {
  if (this.isUsed) {
    return { success: false, message: "OTP already used" };
  }

  if (new Date() > this.expiresAt) {
    return { success: false, message: "OTP expired" };
  }

  if (this.attempts >= this.maxAttempts) {
    return { success: false, message: "Maximum attempts exceeded" };
  }

  this.attempts += 1;

  if (this.otpCode !== enteredOtp) {
    this.save();
    return { success: false, message: "Invalid OTP" };
  }

  this.isUsed = true;
  this.usedAt = new Date();
  this.save();
  return { success: true, message: "OTP verified successfully" };
};

// Method to check if OTP is expired
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to check if attempts exceeded
otpSchema.methods.isMaxAttemptsExceeded = function () {
  return this.attempts >= this.maxAttempts;
};

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Indexes
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
