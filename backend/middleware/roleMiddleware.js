/**
 * Role authorization middleware
 * Ensures the authenticated user possesses one of the allowed roles
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires ${allowedRoles.join(" or ")} role.`,
      });
    }

    next();
  };
};

module.exports = {
  authorizeRole,
  authorizeOwner: authorizeRole("owner"),
  authorizeUser: authorizeRole("user"),
};
