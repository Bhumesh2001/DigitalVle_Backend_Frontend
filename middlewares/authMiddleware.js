const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHandler");

const authenticate = (role) => (req, res, next) => {
    try {
        let token = req.cookies[role === "admin" ? "token_" : "token"] ||
            (req.headers.authorization?.split(" ")[1] || null);

        if (!token) return errorResponse(res, 401, "Unauthorized, no token provided");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authenticate;
