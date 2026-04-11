// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
  return phoneRegex.test(phone);
};

// Strong password validation
export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Get password strength feedback
export const getPasswordStrength = (password) => {
  let strength = "weak";
  let feedback = [];

  if (password.length >= 8) feedback.push("✓ At least 8 characters");
  if (/[A-Z]/.test(password)) feedback.push("✓ Contains uppercase letter");
  if (/[a-z]/.test(password)) feedback.push("✓ Contains lowercase letter");
  if (/\d/.test(password)) feedback.push("✓ Contains number");
  if (/[@$!%*?&]/.test(password)) feedback.push("✓ Contains special character");

  if (feedback.length >= 4) strength = "strong";
  else if (feedback.length >= 2) strength = "medium";

  return { strength, feedback };
};

// Account number validation
export const validateAccountNumber = (accountNumber) => {
  return /^\d{10,18}$/.test(accountNumber);
};

// Amount validation
export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};
