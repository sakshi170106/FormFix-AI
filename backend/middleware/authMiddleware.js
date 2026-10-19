const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
    } else if (req.headers["x-auth-token"]) {
        token = req.headers["x-auth-token"].trim();
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required"
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role || "student"
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

authMiddleware.requireAuth = authMiddleware;
authMiddleware.authMiddleware = authMiddleware;

module.exports = authMiddleware;
module.exports.requireAuth = authMiddleware;
module.exports.authMiddleware = authMiddleware;