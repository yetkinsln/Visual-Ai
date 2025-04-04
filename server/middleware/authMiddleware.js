const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>" içinden sadece token’ı al

    if (!token) {
        return res.status(403).json({ message: "Access Denied: Token Format Incorrect" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // 👈 `req.user.userId` olarak erişilebilir
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
