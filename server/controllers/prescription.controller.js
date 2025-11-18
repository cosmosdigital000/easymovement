import { Booking } from "../models/booking.js";
import Prescription from "../models/prescription.js";
import User from "../models/user.js";
import crypto from "crypto";
import mongoose from "mongoose";

export const getPrescriptions = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Auth Verification
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Forbidden - doctor access required" });
    }

    // Finding all prescriptions for the doctor - simplified populate to avoid errors
    const prescriptions = await Prescription.find({
      doctor: user.id,
    })
      .populate("patient", "full_name email")
      .populate("physicalExaminer", "full_name email")
      .sort({ dateIssued: -1 });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.log("Error in getPrescriptions:", error);
    console.log("Error details:", error.message);
    console.log("Stack trace:", error.stack);
    res.status(500).json({ 
      message: "Internal server error",
      details: error.message 
    });
  }
};

export const createPrescription = async (req, res) => {
  const {
    prescriptionText,
    medications,
    diagnosis,
    patientId,
    notes,
    paymentAmount,
    expiryDate,
    appointmentId,
    patientHistory,
    treatmentPlan,
    followUpDate,
    physicalExaminer,
    investigation,
    vitals,
    complaints,
    tests,
    doctorId, // Added doctorId to support prescription creation from appointments
    // Patient details for creating user if needed
    patientName,
    patientEmail,
    patientPhone,
    patientAge,
    patientAddress,
  } = req.body;
  try {
    const { id: userId } = req.params;

    // Auth Verification
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Forbidden - doctor access required" });
    }

    // Validate and filter medications - only include medications with at least a name
    const validMedications = (medications || []).filter(med => 
      med && med.name && med.name.trim() !== ""
    );

    // Generate unique shareable ID
    const shareableId = crypto.randomBytes(10).toString("hex");

    // Validate ObjectIds
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
    
    // Handle cases where we don't have a valid patient ID
    let finalPatientId;
    if (patientId && isValidObjectId(patientId)) {
      finalPatientId = patientId;
    } else if (patientName || patientEmail || patientPhone) {
      // Create a new user record from patient details
      try {
        // Check if user exists first
        let existingUser = null;
        if (patientEmail) {
          existingUser = await User.findOne({ email: patientEmail });
        }
        if (!existingUser && patientPhone) {
          existingUser = await User.findOne({ phoneNumber: patientPhone });
        }
        
        if (existingUser) {
          finalPatientId = existingUser._id;
        } else {
          // Create new user record
          const newUser = new User({
            full_name: patientName || "Unknown Patient",
            email: patientEmail || undefined,
            phoneNumber: patientPhone || undefined,
            age: patientAge || undefined,
            address: patientAddress || undefined,
            role: "user",
            password: "temp_password_" + Date.now(),
          });
          
          const savedUser = await newUser.save();
          finalPatientId = savedUser._id;
        }
      } catch (userCreationError) {
        console.log("Error creating patient user:", userCreationError);
        return res.status(400).json({ 
          message: "Failed to create patient record",
          details: userCreationError.message
        });
      }
    } else {
      return res.status(400).json({ 
        message: "Invalid patient information",
        details: "Patient ID or patient details (name/email/phone) are required to create a prescription."
      });
    }

    // Create Prescriptions based on userID - simplified to avoid validation errors
    const prescription = await Prescription.create({
      doctor: user.id, // Always use the authenticated user as the doctor
      prescriptionText,
      medications: validMedications,
      diagnosis: diagnosis || "",
      patient: finalPatientId,
      notes: notes || "",
      expiryDate: expiryDate || null,
      paymentAmount: paymentAmount || null,
      appointment: appointmentId && isValidObjectId(appointmentId) ? appointmentId : null,
      shareableId,
      patientHistory: patientHistory || "",
      treatmentPlan: treatmentPlan || "",
      followUpDate: followUpDate || null,
      physicalExaminer: physicalExaminer && isValidObjectId(physicalExaminer) ? physicalExaminer : null,
      investigation: investigation || "",
      vitals: vitals || "",
      complaints: complaints || "",
      tests: tests || "",
    });

    // update prescription details in the user's prescriptions array
    await user.updateOne({
      $push: { prescriptions: prescription._id },
    });

    res.status(201).json({
      message: "Prescription created successfully",
      prescription,
      shareableUrl: `/prescription/share/${shareableId}`,
    });
  } catch (error) {
    console.log("Error in createPrescription:", error);
    
    // More detailed error handling with specific error messages
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error", 
        details: validationErrors.join(", ")
      });
    } else if (error.name === "MongoError" && error.code === 11000) {
      return res.status(409).json({ 
        message: "Duplicate entry error",
        details: "A prescription with this information already exists."
      });
    } else {
      res.status(500).json({ 
        message: "Failed to create prescription",
        details: error.message || "Internal server error" 
      });
    }
  }
};

export const getPatientPaymentStatus = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { patientId } = req.params;

    // Auth Verification
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify role of the user
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Forbidden - doctor access required" });
    }

    // Check if patientId is a valid ObjectId
    const prescriptions = await Prescription.find({
      doctor: userId,
      patient: patientId,
    });

    // Check if prescriptions exist for the patient
    if (!prescriptions || prescriptions.length === 0) {
      return res
        .status(404)
        .json({ message: "No prescriptions found for this patient" });
    }

    res.status(200).json(prescriptions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { prescriptionId } = req.params;
    const { paymentStatus, paymentDate, paymentAmount } = req.body;

    // Auth Verification
    if (!userId) {
      console.log("Unauthorized: No userId in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("role");

    // Check if user is a doctor
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "doctor") {
      console.log("Forbidden - user role is not doctor:", user.role);
      return res
        .status(403)
        .json({ message: "Forbidden - doctor access required" });
    }

    // Find all prescriptions by the id
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Update the payment status in the prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        paymentStatus,
        paymentDate:
          paymentDate || (paymentStatus === "paid" ? new Date() : null),
        paymentAmount,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Payment status updated successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPatientsWithAppointments = async (req, res) => {
  try {
    const { id: userId } = req.params;

    // Enhanced logging for debugging
    console.log("User ID from request:", userId);
    console.log(
      "Authorization header:",
      req.headers.authorization ? "Present" : "Missing"
    );

    // Auth Verification
    if (!userId) {
      console.log(
        "Unauthorized: No userId in request for getPatientsWithAppointments"
      );
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate the user exists and is a doctor
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is a doctor
    if (user.role !== "doctor") {
      console.log("Forbidden - user role is not doctor:", user.role);
      return res
        .status(403)
        .json({ message: "Forbidden - doctor access required" });
    }

    // Find patients who have appointments with the doctor
    // Using .lean() for better performance
    const bookings = await Booking.find({ doctor: user.id })
      .sort({ date: -1 })
      .lean();

    console.log(`Found ${bookings.length} bookings for doctor ${userId}`);

    if (!bookings || bookings.length === 0) {
      // Return empty array instead of 404 error
      console.log("No bookings found for doctor ID:", userId);
      return res.status(200).json([]);
    }

    // Get unique patient IDs from bookings
    const uniquePatientIds = [
      ...new Set(bookings.map((booking) => booking.user.toString())),
    ];
    console.log(`Found ${uniquePatientIds.length} unique patients`);

    // Fetch all patient details in a single query
    const allPatients = await User.find({
      _id: { $in: uniquePatientIds },
    })
      .select("_id full_name email phoneNumber")
      .lean();

    // Create a map for quick lookup
    const patientsMap = {};
    allPatients.forEach((patient) => {
      patientsMap[patient._id.toString()] = patient;
    });

    // Map latest booking for each patient
    const latestBookingByPatient = {};
    bookings.forEach((booking) => {
      const patientId = booking.user.toString();
      if (
        !latestBookingByPatient[patientId] ||
        new Date(booking.date) >
          new Date(latestBookingByPatient[patientId].date)
      ) {
        latestBookingByPatient[patientId] = booking;
      }
    });

    // Combine patient details with their latest appointment info
    const patientsWithAppointments = uniquePatientIds
      .map((patientId) => {
        const patient = patientsMap[patientId];
        const latestBooking = latestBookingByPatient[patientId];

        if (!patient) {
          console.log(
            `Warning: Patient with ID ${patientId} not found in database`
          );
          return null;
        }

        return {
          _id: patient._id,
          full_name: patient.full_name,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          appointmentDate: latestBooking?.date || null,
          appointmentTime: latestBooking?.time || null,
          appointmentStatus: latestBooking?.status || null,
        };
      })
      .filter(Boolean); // Remove any null entries

    console.log(
      `Returning ${patientsWithAppointments.length} patients with appointment details`
    );

    res.status(200).json(patientsWithAppointments);
  } catch (error) {
    console.log("Error in getPatientsWithAppointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPrescriptionByShareableId = async (req, res) => {
  try {
    const { shareableId } = req.params;

    const prescription = await Prescription.findOne({ shareableId })
      .populate("doctor", "full_name email")
      .populate("patient", "full_name");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPrescriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Find prescriptions where the user is the patient
    const prescriptions = await Prescription.find({ patient: userId })
      .populate({
        path: "doctor",
        select: "full_name email _id",
        model: "User",
      })
      .sort({ dateIssued: -1 });

    // Return empty array if no prescriptions found (instead of error)
    if (!prescriptions || prescriptions.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.log("Error in getUserPrescriptions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSinglePrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    console.log("=== getSinglePrescription ===");
    console.log("Getting prescription with ID:", prescriptionId);
    console.log("User making request:", req.user ? req.user.id : 'No user in request');
    console.log("Auth token present:", req.headers.authorization ? 'Yes' : 'No');
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);

    if (!prescriptionId) {
      console.log("No prescription ID provided");
      return res.status(400).json({ message: "Prescription ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      console.log("Invalid prescription ID format:", prescriptionId);
      return res.status(400).json({ message: "Invalid prescription ID format" });
    }

    console.log("Attempting to find prescription in database...");

    // No doctor-specific restrictions - anyone with valid auth can get prescription
    const prescription = await Prescription.findById(prescriptionId)
      .populate("patient", "full_name email")
      .populate("physicalExaminer", "full_name email")
      .populate("doctor", "full_name email");

    if (!prescription) {
      console.log("Prescription not found for ID:", prescriptionId);
      
      // Let's also check if there are any prescriptions at all
      const totalCount = await Prescription.countDocuments();
      console.log("Total prescriptions in database:", totalCount);
      
      return res.status(404).json({ message: "Prescription not found. It may have been deleted." });
    }

    console.log("Successfully found prescription:", prescription._id);
    console.log("Doctor:", prescription.doctor);
    console.log("Patient:", prescription.patient);
    
    return res.status(200).json(prescription);
  } catch (error) {
    console.log("Error in getSinglePrescription:", error);
    console.log("Error details:", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error",
      details: error.message 
    });
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const { id: userId, prescriptionId } = req.params;
    const {
      prescriptionText,
      medications,
      diagnosis,
      notes,
      paymentAmount,
      expiryDate,
      patientHistory,
      treatmentPlan,
      followUpDate,
      physicalExaminer,
      investigation,
      vitals,
      complaints,
      tests,
    } = req.body;

    console.log("Updating prescription:", prescriptionId, "by doctor:", userId);

    // Auth Verification
    if (!userId) {
      console.log("No userId provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "doctor") {
      console.log("User not found or not a doctor:", userId);
      return res.status(403).json({ message: "Forbidden - doctor access required" });
    }

    // Validate prescription ID
    if (!mongoose.Types.ObjectId.isValid(prescriptionId)) {
      console.log("Invalid prescription ID format:", prescriptionId);
      return res.status(400).json({ message: "Invalid prescription ID format" });
    }

    // Check if prescription exists - allow any doctor to edit (removed ownership restriction)
    const existingPrescription = await Prescription.findById(prescriptionId);

    if (!existingPrescription) {
      console.log("Prescription not found:", prescriptionId);
      return res.status(404).json({ message: "Prescription not found" });
    }

    console.log("Found existing prescription:", existingPrescription._id);
    console.log("Original doctor:", existingPrescription.doctor);
    console.log("Updating doctor:", userId);

    // Validate and filter medications
    const validMedications = (medications || []).filter(med => 
      med && med.name && med.name.trim() !== ""
    );

    // Validate ObjectIds
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    // Update the prescription
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      {
        prescriptionText,
        medications: validMedications,
        diagnosis: diagnosis || "",
        notes: notes || "",
        expiryDate: expiryDate || null,
        paymentAmount: paymentAmount || null,
        patientHistory: patientHistory || "",
        treatmentPlan: treatmentPlan || "",
        followUpDate: followUpDate || null,
        physicalExaminer: physicalExaminer && isValidObjectId(physicalExaminer) ? physicalExaminer : null,
        investigation: investigation || "",
        vitals: vitals || "",
        complaints: complaints || "",
        tests: tests || "",
      },
      { new: true }
    );

    console.log("Prescription updated successfully:", prescriptionId);

    res.status(200).json({
      message: "Prescription updated successfully",
      prescription: updatedPrescription,
    });
  } catch (error) {
    console.log("Error in updatePrescription:", error);
    console.log("Error details:", error.message);
    res.status(500).json({ 
      message: "Internal server error",
      details: error.message 
    });
  }
};
