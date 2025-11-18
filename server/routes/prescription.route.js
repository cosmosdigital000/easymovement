import express from "express";
import {
  createPrescription,
  getPatientPaymentStatus,
  getPatientsWithAppointments,
  getPrescriptionByShareableId,
  getPrescriptions,
  getUserPrescriptions,
  updatePaymentStatus,
  getSinglePrescription,
  updatePrescription,
} from "../controllers/prescription.controller.js";
import { verifyToken, isDoctor } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route - no authentication needed
router.get("/share/:shareableId", getPrescriptionByShareableId);

// Protected routes - authentication required
router.use(verifyToken);

// User route - get user's prescriptions
router.get("/user/:userId", getUserPrescriptions);

// Single prescription route (needs authentication but not doctor role)
router.get("/single/:prescriptionId", getSinglePrescription);

// Doctor-only routes
router.post("/create/:id", isDoctor, createPrescription);
router.put("/:id/update/:prescriptionId", isDoctor, updatePrescription);
router.get(
  "/:id/patients-with-appointments",
  isDoctor,
  getPatientsWithAppointments
);
router.get(
  "/:id/patient/:patientId/payments",
  isDoctor,
  getPatientPaymentStatus
);
router.patch("/:id/payment/:prescriptionId", isDoctor, updatePaymentStatus);
router.get("/:id", isDoctor, getPrescriptions);

export default router;
