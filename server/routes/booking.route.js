import express from "express";
import {
  CreateBooking,
  DeleteBooking,
  GetBooking,
  getBookingId,
  GetBookings,
  GetAllBookings,
  GetUserBookings,
  slotAvailability,
  UpdateBooking,
} from "../controllers/booking.controller.js";
import { verifyToken, isDoctor } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes - no authentication needed
router.post("/time-slot", slotAvailability);
router.post("/create", CreateBooking);

// Protected routes - authentication required
router.use(verifyToken);

// General booking routes (auth needed)
router.get("/single/:id", GetBooking);
router.get("/user/:userId", GetUserBookings);
router.post("/update/:id", UpdateBooking);
router.delete("/delete/:id", DeleteBooking);
router.post("/:doctorId/details/:userId", getBookingId);

// Doctor-only routes
router.get("/all", isDoctor, GetAllBookings);
router.get("/:id", isDoctor, GetBookings);

export default router;
