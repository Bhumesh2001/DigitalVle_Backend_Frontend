const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/response.util");

/**
 * Authenticate middleware
 * Accepts optional array of roles to allow (e.g., ["user", "admin"])
 */
const authenticate = (allowedRoles = []) => (req, res, next) => {
    try {

        // Use query param `r` to detect role type (default to "user")
        const roleQuery = req.query.r || "user";

        // Check both cookies and Authorization header
        const token = roleQuery === "admin" ? req.cookies?.token_ || null : req.cookies?.token || null;

        if (!token) return errorResponse(res, 401, "Unauthorized");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional: check role if decoded contains role info
        if (decoded.role && !allowedRoles.includes(decoded.role)) {
            return errorResponse(res, 403, "Forbidden");
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticate };
