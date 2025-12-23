import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header("Authorization");

        // Check if token exists
        if (!authHeader) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Check if token is in Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};