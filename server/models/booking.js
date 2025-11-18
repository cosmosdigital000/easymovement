import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Patient details stored directly in booking
    patientName: {
      type: String,
      required: false,
    },
    patientEmail: {
      type: String,
      required: false,
    },
    patientPhone: {
      type: String, 
      required: false,
    },
    patientAge: {
      type: Number,
      required: false,
    },
    patientAddress: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "scheduled", "completed"],
      default: "pending",
    },
    issue: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", BookingSchema);
