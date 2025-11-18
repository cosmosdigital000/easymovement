import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Optional for authentication methods that don't use password
    },
    phoneNumber: {
      type: String,
      required: false,
      unique: true,
    },
    role: {
      type: String,
      enum: ["doctor", "user"],
      default: null,
      required: false,
    },
    full_name: {
      type: String,
    },
    age: {
      type: Number,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prescription",
      },
    ],
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
