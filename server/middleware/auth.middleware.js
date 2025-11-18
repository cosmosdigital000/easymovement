import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Enhanced validation: verify the user still exists in the database
    const userExists = await User.findById(verified.id);
    if (!userExists) {
      return res.status(401).json({
        message: "User no longer exists in the system. Please register again.",
      });
    }

    // Add fresh user data to the request
    req.user = {
      ...verified,
      role: userExists.role, // Ensure we always have the latest role from DB
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ message: "Invalid token. Please log in again." });
    } else {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};

export const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === "doctor") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Doctor role required." });
  }
};

export const isUser = (req, res, next) => {
  if (req.user && req.user.role === "user") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. User role required." });
  }
};
