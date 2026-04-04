// middleware/roleMiddleware.js

/**
 * Check if user has admin role
 * Use AFTER authMiddleware (verifyToken)
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
};

/**
 * Check if user has user role (or higher)
 */
const isUser = (req, res, next) => {
  if (req.user && (req.user.role === "user" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({ message: "Access denied." });
};

module.exports = { isAdmin, isUser };