const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    const isTokenBlacklisted = await blacklistTokenModel.findOne({ token });

    if (isTokenBlacklisted) {
      return res.status(401).json({ message: "Token is invalid" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret",
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  authUser,
};
