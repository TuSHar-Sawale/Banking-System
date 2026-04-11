import jwt from "jsonwebtoken";

// Generate JWT Token
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );
};

// Generate Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );
};

// Verify Token
export const verifyToken = (token, isRefresh = false) => {
  try {
    const secret = isRefresh
      ? process.env.REFRESH_TOKEN_SECRET
      : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Decode Token (without verification)
export const decodeToken = (token) => {
  return jwt.decode(token);
};
