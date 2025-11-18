import express from "express";
import {
  verifyAdminPassword,
  doctorLogin,
  registerDoctor,
  getUserDetails,
  getBasicUserInfo,
  authFunction,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin firewall - publicly accessible
router.post("/admin-firewall", verifyAdminPassword);

// Doctor authentication routes (no token required)
router.post("/doctor/login", doctorLogin);
router.post("/doctor/register", registerDoctor);

// Public routes for unauthenticated appointment booking
router.post("/user", getBasicUserInfo);
router.post("/", authFunction);

// Protected routes - require authentication  
router.use(verifyToken);

// Get user details by ID
router.get("/:id", getUserDetails);

export default router;
