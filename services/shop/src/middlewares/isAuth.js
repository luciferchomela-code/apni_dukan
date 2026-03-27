import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Please login" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Please login" });
        }

        const decodedValue = jwt.verify(token, process.env.JWT_SEC); // ✅ no TS cast

        if (!decodedValue || !decodedValue.user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decodedValue.user;
        next();

    } catch (error) {
        return res.status(500).json({ message: "Please login - JWT error" });
    }
};

export const isSeller = async (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== "seller") {  // ✅ fixed condition
        return res.status(403).json({ message: "you are not an authorized seller" });
    }
    next();
};