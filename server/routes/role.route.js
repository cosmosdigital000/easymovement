import express from "express";
import {
  getDoctors,
  roleFunction,
  updateRole,
} from "../controllers/role.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route - available without authentication
router.get("/doctors", getDoctors);

// Protected routes
router.use(verifyToken);
router.post("/update", updateRole);
router.get("/:id", roleFunction);

export default router;
