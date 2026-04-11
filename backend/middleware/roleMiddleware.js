// Middleware to check user role
export const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No user authenticated" });
    }

    // Convert single role to array if needed
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// Shortcut middlewares for specific roles
export const adminOnly = roleMiddleware("admin");
export const customerOnly = roleMiddleware("customer");

// Middleware to check if user is account owner or admin
export const checkAccountOwnership = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.userId;
    const userRole = req.user.role;

    // Admin can access any account, user can only access their own
    if (userRole !== "admin" && userId !== requestingUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    next();
  } catch (error) {
    console.error("Ownership check error:", error);
    return res.status(500).json({ message: "Error checking ownership" });
  }
};
